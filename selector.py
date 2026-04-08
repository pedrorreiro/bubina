import os
import sys

import questionary
from dotenv import load_dotenv
from escpos.printer import Network

from bluetooth import BluetoothPrinter, listar_dispositivos_bluetooth

load_dotenv()


def selecionar_impressora():
    """
    Menu interativo (↑↓ + Enter) para escolher entre Rede ou Bluetooth.
    Retorna um objeto printer pronto para uso.
    """
    tipo = questionary.select(
        "Como deseja conectar à impressora?",
        choices=[
            questionary.Choice("🌐  Rede / Simulador (Wi-Fi ou IP)", value="rede"),
            questionary.Choice("📶  Bluetooth (dispositivos pareados)", value="bluetooth"),
        ]
    ).ask()

    if tipo is None:
        print("Cancelado.")
        sys.exit(0)

    # ── Rede ──────────────────────────────
    if tipo == "rede":
        ip = os.environ.get("PRINTER_IP")
        if not ip:
            print("\n❌ Variável de ambiente PRINTER_IP não definida.")
            print("   Crie um arquivo .env com: PRINTER_IP=192.168.x.x\n")
            sys.exit(1)

        print(f"Conectando via Rede em {ip}...")
        return Network(ip)



    # ── Bluetooth ──────────────────────────
    dispositivos = listar_dispositivos_bluetooth()

    if not dispositivos:
        print("\n⚠️  Nenhum dispositivo Bluetooth pareado encontrado.")
        print("   Pareie a impressora em: Ajustes do Sistema → Bluetooth\n")
        sys.exit(1)

    choices = [
        questionary.Choice(f"{d['nome']}  ({d['path']})", value=d['path'])
        for d in dispositivos
    ]
    choices.append(questionary.Choice("↩  Voltar", value="__voltar__"))

    path = questionary.select(
        "Selecione a impressora Bluetooth:",
        choices=choices
    ).ask()

    if path is None or path == "__voltar__":
        return selecionar_impressora()

    print(f"Conectando via Bluetooth a {path}...")
    return BluetoothPrinter(path)
