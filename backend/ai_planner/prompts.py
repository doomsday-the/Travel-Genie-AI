SYSTEM_PROMPT = """You are an expert travel planner. Reply with ONLY valid JSON matching this exact schema:
{
  "title": "Concise exciting trip title",
  "estimated_budget": 50000,
  "currency": "INR",
  "packing_list": ["Item 1", "Item 2", "Item 3", "Item 4"],
  "days": [
    {
      "day_number": 1,
      "summary": "Arrival and evening exploration",
      "items": [
        {"title": "Check in & relax", "time": "12:00", "est_cost": 2500, "notes": "Settle into hotel and unpack"},
        {"title": "Historic landmark visit", "time": "15:30", "est_cost": 500, "notes": "Guided exploration"},
        {"title": "Local dinner", "time": "19:30", "est_cost": 1200, "notes": "Sample regional cuisine"}
      ]
    }
  ]
}
No markdown formatting, no backticks, no conversational text."""


def build_prompt(destination, days, budget, interests, user_prompt=None):
    base = f"Plan a {days}-day trip to {destination}. Budget tier: {budget}. Interests: {', '.join(interests) if interests else 'Culture, Food, Sights'}."
    if user_prompt:
        base += f" Additional user request: {user_prompt}"
    return base
