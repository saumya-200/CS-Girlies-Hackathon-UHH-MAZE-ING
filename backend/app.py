# backend/app.py
import os
import re
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import urllib.parse

from flask import (
    Flask, jsonify, request, send_file, abort
)
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Google Gemini – NEW official client
# pip install google-genai
try:
    from google import genai
except Exception:
    genai = None

# Configuration paths
BASE_DIR = Path(__file__).resolve().parent
STUDY_DIR = BASE_DIR / "study-materials"

# API Key
GEMINI_API_KEY = (
    os.environ.get("GEMINI_API_KEY")
    or os.environ.get("GEMINI_KEY")
    or os.environ.get("GOOGLE_API_KEY")
)

MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

app = Flask(__name__)
CORS(app)

# Allowed filename format: topic_level.pdf
ALLOWED_FILENAME_RE = re.compile(r"^[a-z0-9\-_]+_[1-9]\d*\.pdf$", flags=re.I)

# Demo fallback questions
DEMO_QUESTIONS = [
    {
        "id": "demo_1",
        "type": "multiple_choice",
        "prompt": "What is the purpose of linear regression?",
        "options": ["Classify data", "Predict continuous values", "Cluster data", "Reduce dimensions"],
        "correctAnswer": 1,
        "explanation": "Linear regression predicts a continuous output."
    },
    {
        "id": "demo_2",
        "type": "short_answer",
        "prompt": "Name a common algorithm for fitting linear models iteratively.",
        "correctAnswer": "gradient descent",
        "explanation": "Gradient descent is used to minimize loss functions iteratively."
    }
]


# -----------------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------------

def list_available_materials() -> List[Dict[str, Any]]:
    """List study-material PDFs: { topic, level, filename }"""
    files = []
    if not STUDY_DIR.exists():
        return files

    for f in STUDY_DIR.iterdir():
        if f.is_file() and f.suffix.lower() == ".pdf":
            m = re.match(r"^(.+?)_(\d+)\.pdf$", f.name, flags=re.I)
            if m:
                topic = m.group(1)
                level = int(m.group(2))
                files.append({
                    "topic": topic,
                    "level": level,
                    "filename": f.name
                })
    return files


def safe_parse_json(text: str) -> Optional[Dict]:
    """Parse JSON with fallback recovery."""
    if not text:
        return None

    text = re.sub(r"^```json\s*", "", text, flags=re.I)
    text = re.sub(r"```$", "", text, flags=re.I).strip()

    try:
        return json.loads(text)
    except Exception:
        pass

    m = re.search(r"\{[\s\S]*\}", text)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass

    return None


# -----------------------------------------------------------------------------------
# Gemini API JSON Generator (NEW CLIENT)
# -----------------------------------------------------------------------------------

def call_gemini_generate_json(prompt: str, model: str = MODEL) -> Optional[Dict]:
    """Call Gemini using the new official Python client."""

    print(f"\n[DEBUG] GEMINI CALL STARTED")
    print(f"[DEBUG] MODEL: {model}")
    print(f"[DEBUG] API KEY SET: {'YES' if GEMINI_API_KEY else 'NO'}")
    print(f"[DEBUG] PROMPT:\n---\n{prompt}\n---\n")

    if genai is None:
        print("[ERROR] google-genai package NOT installed. Install with: pip install google-genai")
        return None

    if GEMINI_API_KEY is None:
        print("[ERROR] GEMINI_API_KEY not found in environment!")
        return None

    try:
        print("[DEBUG] Initializing Gemini Client...")
        client = genai.Client(api_key=GEMINI_API_KEY)

        print(f"[DEBUG] Calling generate_content() with model='{model}'...")
        response = client.models.generate_content(
            model=model,
            contents=prompt
        )

        print(f"[DEBUG] Raw response received: {response}")
        print(f"[DEBUG] Response type: {type(response)}")

        # Extract text
        try:
            text = response.text.strip()
            print(f"[DEBUG] response.text: {text}")
        except Exception as e:
            print(f"[WARN] response.text failed: {e}")
            text = ""

        if not text:
            try:
                part = response.candidates[0].content.parts[0]
                text = part.text.strip()
                print(f"[DEBUG] Extracted from candidates[0].parts[0]: {text}")
            except Exception as e:
                print(f"[ERROR] Failed to extract from candidates: {e}")
                text = ""

        if not text:
            print("[ERROR] Gemini returned EMPTY text!")
            return None

        print(f"[DEBUG] Final extracted text:\n---\n{text}\n---\n")

        print("[DEBUG] Parsing JSON...")
        parsed = safe_parse_json(text)

        if parsed:
            print(f"[SUCCESS] JSON parsed successfully!")
            print(f"[DEBUG] Parsed questions count: {len(parsed.get('questions', []))}")
        else:
            print("[ERROR] Failed to parse JSON from Gemini output")

        return parsed

    except Exception as e:
        print(f"[FATAL] Gemini API call FAILED: {e}")
        import traceback
        print(traceback.format_exc())
        return None
# -----------------------------------------------------------------------------------
# Endpoints: Quiz Generation
# -----------------------------------------------------------------------------------

@app.route("/api/quiz", methods=["POST"])
def generate_quiz():
    print(f"\n[REQUEST] /api/quiz called")
    print(f"[REQUEST] Headers: {dict(request.headers)}")
    print(f"[REQUEST] Raw body: {request.get_data(as_text=True)}")

    try:
        body = request.get_json(force=True)
        print(f"[REQUEST] Parsed JSON: {body}")
    except Exception as e:
        print(f"[ERROR] Invalid JSON: {e}")
        return jsonify({"error": "Invalid JSON"}), 400

    topic = body.get("topic")
    level = int(body.get("level", 1))
    count = int(body.get("count", 6))

    print(f"[REQUEST] topic='{topic}', level={level}, count={count}")

    if not topic:
        print("[ERROR] Missing topic")
        return jsonify({"error": "Missing topic"}), 400

    prompt = f"""
Generate exactly {count} quiz questions for topic "{topic}" at Level {level}.
Return ONLY valid JSON:

{{
  "questions": [
    {{
      "id": "q1",
      "type": "multiple_choice",
      "prompt": "What is X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "..."
    }}
  ]
}}
Include a mix of multiple_choice, true_false, and short_answer.
Give more and more numbers of mcqs and fewer true_false.
"""

    print(f"[DEBUG] Sending prompt to Gemini...")
    result = call_gemini_generate_json(prompt)

    if result and "questions" in result and isinstance(result["questions"], list) and len(result["questions"]) > 0:
        questions = []
        for i, q in enumerate(result["questions"]):
            qid = q.get("id", f"g_{topic}_{level}_{i}")
            normalized = {
                "id": qid,
                "type": q.get("type"),
                "prompt": q.get("prompt"),
                "options": q.get("options"),
                "correctAnswer": q.get("correctAnswer"),
                "explanation": q.get("explanation"),
                "hint": q.get("hint", "Think about the concept."),
                "topic": topic,
                "difficulty": level,
                "estimatedTimeSeconds": 20
            }
            questions.append(normalized)
            print(f"[DEBUG] Added question {i+1}: {qid} | type={q.get('type')}")

        print(f"[SUCCESS] Returning {len(questions)} questions from Gemini")
        return jsonify({"questions": questions}), 200

    print("[WARN] Gemini failed → returning DEMO_QUESTIONS")
    return jsonify({"questions": DEMO_QUESTIONS}), 200
# -----------------------------------------------------------------------------------
# Endpoints: Study Material Files
# -----------------------------------------------------------------------------------

@app.route("/api/materials/list", methods=["GET"])
def materials_list():
    return jsonify({"materials": list_available_materials()}), 200


@app.route("/api/materials/<topic>/<int:level>/download", methods=["GET"])
def download_material(topic, level):
    topic_decoded = urllib.parse.unquote(topic).strip()

    topic_clean = topic_decoded.lower()
    topic_clean = re.sub(r"[^a-z0-9_-]", "_", topic_clean)
    topic_clean = re.sub(r"_+", "_", topic_clean)
    topic_clean = topic_clean.strip("_")

    filename = f"{topic_clean}_{level}.pdf"

    # Validate final filename
    if not re.match(r"^[a-z0-9_-]+_[1-9]\d*\.pdf$", filename):
        app.logger.warning(f"Invalid filename after sanitization: {filename}")
        return jsonify({"error": "Invalid filename format"}), 400

    path = STUDY_DIR / filename
    if not path.exists():
        app.logger.warning(f"File not found: {path}")
        return jsonify({"error": "File not found"}), 404

    app.logger.info(f"Downloading: {path}")
    return send_file(
        str(path),
        as_attachment=True,
        download_name=filename,
        mimetype="application/pdf"
    )

# -----------------------------------------------------------------------------------
# Run Server
# -----------------------------------------------------------------------------------

if __name__ == "__main__":
    STUDY_DIR.mkdir(exist_ok=True)
    app.run(host="0.0.0.0", port=8000, debug=False)
