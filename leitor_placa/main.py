import time
import re
import warnings
import cv2
import pytesseract
import requests
from gpiozero import DistanceSensor, AngularServo, LED

# Silencia avisos informativos de PWM por software do gpiozero
warnings.filterwarnings("ignore", category=UserWarning)

# ==============================================================================
# 1. CONFIGURAÇÕES DO SERVIDOR JAVA E PARÂMETROS DO SISTEMA
# ==============================================================================
SERVIDOR_URL = "http://192.168.137.1:8080"
URL_ENTRADA = f"{SERVIDOR_URL}/api/estacionamento/entrada"
URL_SAIDA = f"{SERVIDOR_URL}/api/estacionamento/saida"

DISTANCIA_DETECCAO_CM = 5.0   # Capta veículos a partir de 5 cm ou menos
ANGULO_FECHADO = 0            # Ângulo da cancela abaixada
ANGULO_ABERTO = 90            # Ângulo da cancela aberta (90 graus)

# ==============================================================================
# 2. MAPEAMENTO DOS PINOS GPIO
# ==============================================================================
# Sensores Ultrassônicos HC-SR04
sensor_entrada = DistanceSensor(echo=25, trigger=23, max_distance=2.0)  # Echo: Pino 22 | Trig: Pino 16
sensor_saida = DistanceSensor(echo=8, trigger=24, max_distance=2.0)     # Echo: Pino 24 | Trig: Pino 18

# Servos Motores SG90
servo_entrada = AngularServo(18, min_angle=0, max_angle=180, min_pulse_width=0.0005, max_pulse_width=0.0025)  # Pino 12
servo_saida = AngularServo(13, min_angle=0, max_angle=180, min_pulse_width=0.0005, max_pulse_width=0.0025)    # Pino 33

# LEDs Sinalizadores (Verde = Aceito | Vermelho = Não Aceito)
led_verde_entrada = LED(17)     # Pino 11
led_vermelho_entrada = LED(27)  # Pino 13
led_verde_saida = LED(20)       # Pino 38
led_vermelho_saida = LED(21)    # Pino 40


# ==============================================================================
# 3. FUNÇÕES AUXILIARES (HARDWARE, CÂMERA E OCR)
# ==============================================================================
def mover_cancela(servo, angulo, nome_cancela):
    """Move o servo até o ângulo desejado e desliga o pulso para evitar trepidação."""
    servo.angle = angulo
    time.sleep(0.5)
    servo.detach()
    estado = f"Aberta ({angulo}°)" if angulo == ANGULO_ABERTO else f"Fechada ({angulo}°)"
    print(f"[{nome_cancela}] {estado}.")


def desligar_todos_leds():
    led_verde_entrada.off()
    led_vermelho_entrada.off()
    led_verde_saida.off()
    led_vermelho_saida.off()


def detectar_indices_cameras():
    """Localiza automaticamente os índices reais das duas câmeras USB no Linux."""
    indices_validos = []
    for idx in range(6):
        cap = cv2.VideoCapture(idx)
        if cap.isOpened():
            ret, _ = cap.read()
            if ret:
                indices_validos.append(idx)
            cap.release()
        if len(indices_validos) == 2:
            break

    cam_ent = indices_validos[0] if len(indices_validos) >= 1 else 0
    cam_sai = indices_validos[1] if len(indices_validos) >= 2 else cam_ent
    print(f"[CÂMERAS] Entrada no índice {cam_ent} | Saída no índice {cam_sai}")
    return cam_ent, cam_sai


def corrigir_caracteres_placa(texto):
    """Corrige trocas comuns do OCR (ex: O/0, I/1) nas posições fixas do padrão Mercosul/Antigo."""
    if len(texto) != 7:
        return texto

    mapa_para_letra = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B'}
    mapa_para_numero = {'O': '0', 'Q': '0', 'D': '0', 'I': '1', 'Z': '2', 'S': '5', 'B': '8'}

    chars = list(texto)
    for i in (0, 1, 2):
        chars[i] = mapa_para_letra.get(chars[i], chars[i])
    for i in (3, 5, 6):
        chars[i] = mapa_para_numero.get(chars[i], chars[i])

    return "".join(chars)


def capturar_e_ler_placa(indice_camera, etapa):
    """Captura foto da câmera USB e extrai a placa brasileira (Antiga ou Mercosul)."""
    cap = cv2.VideoCapture(indice_camera)
    if not cap.isOpened():
        print(f"[{etapa}] Erro: Não foi possível abrir a câmera {indice_camera}.")
        return None

    for _ in range(5):
        cap.read()
    ret, frame = cap.read()
    cap.release()

    if not ret or frame is None:
        print(f"[{etapa}] Erro: Falha ao capturar imagem.")
        return None

    cv2.imwrite(f"ultima_captura_{etapa.lower()}.jpg", frame)

    cinza = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    cinza = cv2.bilateralFilter(cinza, 11, 17, 17)
    _, binarizada = cv2.threshold(cinza, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    config_ocr = "--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    texto_bruto = pytesseract.image_to_string(binarizada, config=config_ocr)
    limpo = re.sub(r"[^A-Z0-9]", "", texto_bruto.upper())

    match = re.search(r"[A-Z0-9]{7}", limpo)
    if match:
        candidata = corrigir_caracteres_placa(match.group(0))
        if re.match(r"^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$", candidata):
            return candidata

    print(f"[{etapa}] Leitura inconclusiva (OCR leu: '{limpo}').")
    return None


def sinalizar_recusa(led_vermelho):
    """Mantém o LED vermelho aceso por exatos 3 segundos quando a requisição não é aceita."""
    led_vermelho.on()
    time.sleep(3)
    led_vermelho.off()


def processar_fluxo(etapa, sensor, servo, led_verde, led_vermelho, indice_camera, url_api):
    """Executa leitura da placa, consulta ao servidor Java e acionamento da cancela e LEDs."""
    print(f"\n[{etapa}] Veículo detectado (<= {DISTANCIA_DETECCAO_CM} cm)! Capturando placa...")
    placa = capturar_e_ler_placa(indice_camera, etapa)

    if not placa:
        print(f"[{etapa}] Requisição NÃO ACEITA (placa não identificada).")
        sinalizar_recusa(led_vermelho)
        return

    print(f"[{etapa}] Placa identificada: {placa}. Consultando servidor...")
    try:
        resposta = requests.post(url_api, json={"placa": placa}, timeout=5)
        print(f"[{etapa}] Resposta HTTP {resposta.status_code}: {resposta.text}")

        if resposta.status_code in (200, 201):
            print(f"[{etapa}] Requisição ACEITA para {placa}!")
            # 1. Abre a cancela em 90 graus e acende o LED verde logo após abrir
            mover_cancela(servo, ANGULO_ABERTO, f"CANCELA {etapa}")
            led_verde.on()

            # 2. Aguarda o veículo passar pela frente do sensor
            time.sleep(2.5)
            while (sensor.distance * 100) <= DISTANCIA_DETECCAO_CM:
                time.sleep(0.3)

            # 3. Fecha a cancela (0 graus) e desliga o LED verde logo após fechar
            time.sleep(1.0)
            mover_cancela(servo, ANGULO_FECHADO, f"CANCELA {etapa}")
            led_verde.off()
        else:
            print(f"[{etapa}] Requisição NÃO ACEITA pelo servidor para {placa}.")
            sinalizar_recusa(led_vermelho)

    except requests.exceptions.RequestException as erro:
        print(f"[{etapa}] Falha de comunicação com o servidor Java: {erro}")
        sinalizar_recusa(led_vermelho)


# ==============================================================================
# 4. LOOP PRINCIPAL
# ==============================================================================
if __name__ == "__main__":
    print("Inicializando sistema de estacionamento...")
    desligar_todos_leds()
    mover_cancela(servo_entrada, ANGULO_FECHADO, "CANCELA ENTRADA")
    mover_cancela(servo_saida, ANGULO_FECHADO, "CANCELA SAÍDA")

    cam_entrada_idx, cam_saida_idx = detectar_indices_cameras()
    print(f"Sistema ativo (detecção <= {DISTANCIA_DETECCAO_CM} cm). Pressione Ctrl+C para encerrar.\n")

    try:
        while True:
            dist_entrada = sensor_entrada.distance * 100
            dist_saida = sensor_saida.distance * 100

            if dist_entrada <= DISTANCIA_DETECCAO_CM:
                processar_fluxo(
                    etapa="ENTRADA",
                    sensor=sensor_entrada,
                    servo=servo_entrada,
                    led_verde=led_verde_entrada,
                    led_vermelho=led_vermelho_entrada,
                    indice_camera=cam_entrada_idx,
                    url_api=URL_ENTRADA,
                )
                time.sleep(1.5)

            if dist_saida <= DISTANCIA_DETECCAO_CM:
                processar_fluxo(
                    etapa="SAÍDA",
                    sensor=sensor_saida,
                    servo=servo_saida,
                    led_verde=led_verde_saida,
                    led_vermelho=led_vermelho_saida,
                    indice_camera=cam_saida_idx,
                    url_api=URL_SAIDA,
                )
                time.sleep(1.5)

            time.sleep(0.15)

    except KeyboardInterrupt:
        print("\nEncerrando sistema...")
    finally:
        desligar_todos_leds()
        mover_cancela(servo_entrada, ANGULO_FECHADO, "CANCELA ENTRADA")
        mover_cancela(servo_saida, ANGULO_FECHADO, "CANCELA SAÍDA")