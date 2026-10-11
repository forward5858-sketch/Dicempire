#!/usr/bin/env python3
"""Mağaza metinlerinin karakter sınırlarını denetler.

Kullanım: python3 store/sinir-kontrol.py
Tablolardaki "(≤N)" başlıklı satırları ve <!-- aciklama-xx --> bloklarını okur.
Sınırı aşan bir alan varsa çıkış kodu 1 olur.
"""
import pathlib
import re
import sys

DOSYA = pathlib.Path(__file__).with_name("magaza-metinleri.md")
ACIKLAMA_SINIRI = 4000

metin = DOSYA.read_text(encoding="utf-8")
hatalar = 0

for alan, sinir, deger in re.findall(r"^\| ([^|]+?) \(≤(\d+)\) \| `([^`]*)` \|$", metin, re.M):
    uzunluk = len(deger)
    durum = "TAMAM" if uzunluk <= int(sinir) else "AŞIYOR"
    hatalar += durum != "TAMAM"
    print(f"{durum:7} {uzunluk:4}/{sinir:<4} {alan}")

for dil, govde in re.findall(r"<!-- aciklama-(\w+) -->\n```\n(.*?)\n```\n<!-- /aciklama-\1 -->", metin, re.S):
    uzunluk = len(govde)
    durum = "TAMAM" if uzunluk <= ACIKLAMA_SINIRI else "AŞIYOR"
    hatalar += durum != "TAMAM"
    print(f"{durum:7} {uzunluk:4}/{ACIKLAMA_SINIRI:<4} Açıklama ({dil})")

sys.exit(1 if hatalar else 0)
