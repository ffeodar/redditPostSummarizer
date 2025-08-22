#Installing Ollama
curl -fsSL https://ollama.com/install.sh | sh

#Downloading LLMs
ollama pull gemma3:270m
ollama pull gemma3:1b

#Stopping Ollama
sudo pkill -9 ollama

#Setting environmental variables and starting Ollama
OLLAMA_ORIGINS=chrome-extension://* ollama serve
