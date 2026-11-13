import re
import os
import time
import cv2
import requests
import pytesseract
from gpiozero import OutputDevice

# --- CONFIGURAÇÕES DO HARDWARE E REDE ---

# Pino GPIO onde o módulo relé da catraca está conectado (ex: GPIO 17 - Pino 11 físico)
PINO_RELE = 17
catraca = OutputDevice(PINO_RELE, active_high=False, initial_value=False)

URL_API = os.environ.get("ESTATEC_API_URL", "http://api.estatec.lab/api/acesso/validar")
API_KEY = os.environ.get("ESTATEC_ACCESS_API_KEY", "")
ESTACIONAMENTO_ID = os.environ.get("ESTATEC_ESTACIONAMENTO_ID", "")

def acionar_catraca():
    """Ativa o relé por 3 segundos para abrir a catraca."""
    print("🔓 Catraca LIBERADA!")
    catraca.on()
    time.sleep(3)
    catraca.off()
    print("🔒 Catraca TRAVADA.")

def limpar_texto_placa(texto):
    """Remove caracteres especiais e espaços mantendo padrão Mercosul e antigo."""
    texto_limpo = re.sub(r'[^A-Z0-9]', '', texto.upper())
    return texto_limpo

def enviar_para_backend(placa):
    """Envia a placa e o estacionamento configurado para a API."""
    if not API_KEY or not ESTACIONAMENTO_ID:
        raise RuntimeError("Configure ESTATEC_ACCESS_API_KEY e ESTATEC_ESTACIONAMENTO_ID.")
    payload = {"placa": placa, "estacionamentoId": ESTACIONAMENTO_ID}
    headers = {"Content-Type": "application/json", "X-API-Key": API_KEY}
    
    try:
        print(f"📡 Enviando placa '{placa}' para a API...")
        resposta = requests.post(URL_API, json=payload, headers=headers, timeout=5)
        
        if resposta.status_code == 200:
            dados = resposta.json()
            autorizado = dados.get("autorizado", False)
            mensagem = dados.get("mensagem", "")
            
            print(f"Resposta do Servidor: {mensagem}")
            
            if autorizado:
                acionar_catraca()
            else:
                print("⛔ Acesso Negado: Veículo não cadastrado.")
        else:
            print(f"⚠️ Erro no servidor: Código {resposta.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão com o Spring Boot: {e}")

def processar_frame(frame):
    """Aplica pré-processamento de imagem e realiza a leitura do OCR."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Suavização e binarização para facilitar leitura visual de placas
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Configuração do Tesseract para focar em caracteres alfanuméricos
    config_tesseract = "--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    texto_detectado = pytesseract.image_to_string(thresh, config=config_tesseract)
    
    placa = limpar_texto_placa(texto_detectado)
    
    # Valida se possui o tamanho padrão de placa brasileira (7 caracteres)
    if len(placa) == 7:
        print(f"\n🔍 Placa detectada: {placa}")
        enviar_para_backend(placa)
        return True
    return False

# --- LOOP PRINCIPAL DA WEBCAM ---

def iniciar_camera():
    cap = cv2.VideoCapture(0) # 0 indica a primeira webcam USB conectada
    
    if not cap.isOpened():
        print("❌ Erro: Webcam não encontrada.")
        return

    print("🎥 Câmera iniciada. Pressione 's' para simular leitura ou 'q' para sair.")
    
    cooldown = 0 # Evita múltiplos envios repetidos da mesma placa
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Erro ao capturar imagem da webcam.")
            break

        cv2.imshow("EstaeC - Leitor de Placa", frame)
        key = cv2.waitKey(1) & 0xFF
        
        # Leitura manual pressionando a tecla 's' ou automática no loop
        if key == ord('s') and (time.time() - cooldown > 4):
            if processar_frame(frame):
                cooldown = time.time()
                
        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    iniciar_camera()
