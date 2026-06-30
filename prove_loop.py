import asyncio
from dotenv import load_dotenv
load_dotenv()

from backend import memory

FRAGMENTS = [
    "Around 9pm I was at the Bellagio bar with someone named Sarah.",
    "Sarah said she works as a blackjack dealer and lost my jacket at the pool.",
    "Receipt for $240 from 'Neon Noodle' timestamped 1:14am.",
    "Blurry photo caption: 'me + Sarah + a guy in an Elvis costume'.",
]


async def main():
    await memory.forget()
    for f in FRAGMENTS:
        await memory.remember(f)
    for q in ["What happened last night?", "Who is Sarah?", "Where is my jacket?"]:
        print(f"\n> {q}")
        for answer in await memory.recall(q):
            print("  -", answer)


if __name__ == "__main__":
    asyncio.run(main())
