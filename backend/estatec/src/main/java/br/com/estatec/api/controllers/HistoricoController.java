package br.com.estatec.api.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.estatec.api.services.HistoricoService;

@RestController
@RequestMapping("/Historico")
@CrossOrigin("*")
public class HistoricoController {
	
	@Autowired
	private HistoricoService service;
	
	@PostMapping("/cadastro")
	public ResponseEntity<Usuario>
}
