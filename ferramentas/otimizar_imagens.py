"""Converte fotos para o site: redimensiona e grava em WebP (mais leve) em site/img/.

Uso (a partir da pasta girassol/):
    py ferramentas/otimizar_imagens.py Imagens/ramonovo.jpg Imagens/outra.jpg

Precisa de: py -m pip install --user opencv-python-headless
O nome do ficheiro mantém-se (ramonovo.jpg -> site/img/ramonovo.webp).
"""
import os
import sys

import cv2
import numpy as np

LADO_MAX = 1600   # px no lado maior: chega para ecrãs grandes sem pesar
QUALIDADE = 80    # WebP 0-100

DESTINO = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "img")


def ler(caminho):
    # imdecode lida com acentos/espaços no caminho em Windows
    dados = np.fromfile(caminho, dtype=np.uint8)
    return cv2.imdecode(dados, cv2.IMREAD_COLOR)


def otimizar(caminho):
    img = ler(caminho)
    if img is None:
        print("ignorado (não é imagem):", caminho)
        return
    h, w = img.shape[:2]
    escala = min(1.0, LADO_MAX / max(h, w))
    if escala < 1:
        img = cv2.resize(img, (round(w * escala), round(h * escala)), interpolation=cv2.INTER_AREA)
    nome = os.path.splitext(os.path.basename(caminho))[0] + ".webp"
    ok, buf = cv2.imencode(".webp", img, [cv2.IMWRITE_WEBP_QUALITY, QUALIDADE])
    buf.tofile(os.path.join(DESTINO, nome))
    print(f"{nome}: {w}x{h} -> {img.shape[1]}x{img.shape[0]}, {os.path.getsize(caminho)//1024} KB -> {len(buf)//1024} KB")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    os.makedirs(DESTINO, exist_ok=True)
    for c in sys.argv[1:]:
        otimizar(c)
