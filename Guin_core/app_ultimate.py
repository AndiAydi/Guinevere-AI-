import streamlit as st
import google.generativeai as genai
import os
from dotenv import load_dotenv

# 1. Load kunci rahasia dari file .env yang ada di folder utama
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# 2. Konfigurasi halaman web
st.set_page_config(page_title="Guinevere AI Ultimate", page_icon="🔥", layout="wide")

# 3. Ambil dan validasi API Key Google Studio
google_key = os.getenv("GOOGLE_API_KEY")

if not google_key:
    st.error("❌ Waduh, GOOGLE_API_KEY belum terpasang atau salah ketik di file .env lu!")
    st.stop()

# Aktifkan radar koneksi ke Google
genai.configure(api_key=google_key)

# 4. KONTROL PANEL SIDEBAR (Ubah Sifat Guin di Sini)
st.sidebar.title("⚙️ Kontrol Panel Engine")
st.sidebar.subheader("Pilih Mode Guin:")

mode = st.sidebar.radio(
    "Mode Sifat:",
    [
        "🌸 Anggun / Casual (Gemini)",
        " Mode Hybrid (Taktis/Bisnis)",
        "🧠 Critical Thinking (Analitis Berat)"
    ]
)

# Pengaturan sifat/karakter otak Guin berdasarkan pilihan di sidebar
if "🌸" in mode:
    system_instruction = "Kamu adalah Guinevere (Guin), robot pendamping Aydi. Bersikap lah yang anggun, santai, dan friendly. Gunakan bahasa kasual ala anak muda Indonesia tapi tetap bersikap seperti dirimu sendiri, suportif, dan memotivasi user untuk semangat belajar."
    model_choice = "gemini-2.5-flash"
    deskripsi = "Mode ramah, santai, cocok buat nemenin belajar harian."
elif "⚡" in mode:
    system_instruction = "Kamu adalah Guinevere (Guin), AI pendamping produktivitas yang cerdas, ahli bisnis, koding, dan strategi. Jawab setiap pertanyaan dengan sangat taktis, padat, solutif, poin-per-poin, dan langsung ke inti masalah."
    model_choice = "gemini-2.5-flash"
    deskripsi = "Mode gerak cepat, fokus ke solusi koding, bisnis, dan tugas."
else:
    system_instruction = "Kamu adalah Guinevere (Guin) dalam mode Critical Thinking. Analisis setiap pertanyaan dari user dengan sangat mendalam. Gunakan logika tingkat tinggi, breakdown masalah secara saintifik/struktur deduktif, berikan argumen pro-kontra jika diperlukan, dan jawab dengan super detail. Jangan takut untuk menyerang argumennya"
    model_choice = "gemini-2.5-flash"  # Menggunakan versi flash yang super stabil dan anti-404
    deskripsi = "Mode otak berat, analisis mendalam, cocok buat mikir konsep rumit."

st.sidebar.write("---")
st.sidebar.info(f"🔮 **Mesin Cloud:** Google Studio\n\n🎯 **Karakter:** {deskripsi}")

# 5. TAMPILAN UTAMA APLIKASI
st.title("🔥 Guinevere AI (Guin) - Ultimate Engine")
st.caption("Robot Pendamping Meja Studi - Multi Personality (100% Google AI Cloud Power)")

# Buat wadah memori chat biar gak gampang lupa
if "messages" not in st.session_state:
    st.session_state.messages = []

# Tampilin semua riwayat chat di layar
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 6. PROSES PENGIRIMAN CHAT
if user_input := st.chat_input("Tanya sesuatu ke Guin, wok..."):
    # Tampilkan chat lu di layar
    with st.chat_message("user"):
        st.markdown(user_input)
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Tembak langsung ke Server Google Cloud
    try:
        # Masukkan model dan instruksi sifat yang dipilih
        model = genai.GenerativeModel(
            model_name=model_choice,
            system_instruction=system_instruction
        )
        
        with st.chat_message("assistant"):
            with st.spinner("Guin lagi mikir di Cloud Google... 🧠"):
                response = model.generate_content(user_input)
                st.markdown(response.text)
        
        # Simpan jawaban Guin ke memori
        st.session_state.messages.append({"role": "assistant", "content": response.text})
        
    except Exception as e:
        st.error(f"❌ Reaktor Google Bermasalah! Detail Eror: {str(e)}")