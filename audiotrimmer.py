import os
import sys
from pydub import AudioSegment
from pydub.silence import detect_leading_silence

# Set the path to your FFmpeg executable
ffmpeg_dir = r"C:\Users\benhi\Downloads\ffmpeg-n7.0-latest-win64-gpl-7.0\ffmpeg-n7.0-latest-win64-gpl-7.0\bin"
os.environ["PATH"] += os.pathsep + ffmpeg_dir
AudioSegment.converter = os.path.join(ffmpeg_dir, "ffmpeg.exe")
AudioSegment.ffmpeg = os.path.join(ffmpeg_dir, "ffmpeg.exe")
AudioSegment.ffprobe = os.path.join(ffmpeg_dir, "ffprobe.exe")

def trim_silence(audio, silence_threshold=-50.0, chunk_size=10):
    trim_ms = detect_leading_silence(audio, silence_threshold=silence_threshold, chunk_size=chunk_size)
    return audio[trim_ms:]

def process_audio_files(input_dir, output_dir, silence_threshold=-50.0, min_silence_len=100):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    file_count = 1
    for filename in os.listdir(input_dir):
        if filename.endswith(('.mp3', '.wav')):
            input_path = os.path.join(input_dir, filename)
            output_filename = f"fart{file_count}.mp3"
            output_path = os.path.join(output_dir, output_filename)

            try:
                audio = AudioSegment.from_file(input_path)

                # Trim leading silence
                trimmed_audio = trim_silence(audio, silence_threshold)

                # Trim trailing silence
                trimmed_audio = trimmed_audio.reverse()
                trimmed_audio = trim_silence(trimmed_audio, silence_threshold)
                trimmed_audio = trimmed_audio.reverse()

                # Export the trimmed audio
                trimmed_audio.export(output_path, format="mp3")
                print(f"Processed: {filename} -> {output_filename}")
                file_count += 1
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_directory = os.path.join(script_dir, "farts")
    output_directory = os.path.join(script_dir, "trimmed_farts")
    
    process_audio_files(input_directory, output_directory)