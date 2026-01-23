from dotenv import load_dotenv
load_dotenv()
from langchain_openai import ChatOpenAI

try:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    print("Invoking LLM...")
    res = llm.invoke("Hello")
    print("Success:", res.content)
except Exception as e:
    print("Error:", e)
