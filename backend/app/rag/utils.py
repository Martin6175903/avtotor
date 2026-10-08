import re

from app.rag.constants import STOP_WORDS

def tokenize(text: str) -> set[str]:
  return {
    word
    for word in re.findall(
      r"[a-zа-яё0-9]+",
      text.casefold(),
    )
    if len(word) >= 3
       and word not in STOP_WORDS
  }