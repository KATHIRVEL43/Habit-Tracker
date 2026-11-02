from datetime import datetime, date, timedelta
from typing import List, Set, Dict, Any, Tuple, Optional
from app.core.timezone import get_user_today_date

def calculate_habit_streaks(
    active_days: List[int],
    completed_dates: Set[str], # set of "YYYY-MM-DD" strings
    today: date,
    habit_created_date: Optional[date] = None
) -> Tuple[int, int]:
    """
    Computes (current_streak, best_streak).
    active_days: list of weekday integers (0=Monday, 6=Sunday).
    Scheduled off days (not in active_days) do not break the streak.
    """
    if not active_days:
        active_days = [0, 1, 2, 3, 4, 5, 6]
    
    active_days_set = set(active_days)
    today_str = today.strftime("%Y-%m-%d")
    today_active = today.weekday() in active_days_set
    today_done = today_str in completed_dates

    # 1. Current streak calculation
    current_streak = 0
    if today_active and today_done:
        current_streak += 1
        check_date = today - timedelta(days=1)
    elif today_active and not today_done:
        # Today is not completed yet, so current streak can continue from yesterday
        check_date = today - timedelta(days=1)
    else:
        # Today is rest day
        check_date = today - timedelta(days=1)

    # Walk back up to 365 days
    for _ in range(365):
        if habit_created_date and check_date < habit_created_date:
            break
            
        if check_date.weekday() in active_days_set:
            d_str = check_date.strftime("%Y-%m-%d")
            if d_str in completed_dates:
                current_streak += 1
            else:
                # Missed an active day -> streak breaks
                break
        # If not in active_days_set, it's a scheduled off day, skip it
        check_date -= timedelta(days=1)

    # 2. Best streak calculation
    # Sort completed dates
    valid_completed_dates = []
    for d_str in completed_dates:
        try:
            d = datetime.strptime(d_str, "%Y-%m-%d").date()
            if d.weekday() in active_days_set:
                valid_completed_dates.append(d)
        except Exception:
            continue

    valid_completed_dates.sort()
    
    best_streak = 0
    if valid_completed_dates:
        curr = 0
        prev_date = None
        for d in valid_completed_dates:
            if prev_date is None:
                curr = 1
            else:
                # Count scheduled active days between prev_date and d
                gap_date = prev_date + timedelta(days=1)
                active_days_in_gap = 0
                while gap_date < d:
                    if gap_date.weekday() in active_days_set:
                        active_days_in_gap += 1
                    gap_date += timedelta(days=1)

                if active_days_in_gap == 0:
                    # Consecutive active days!
                    curr += 1
                else:
                    curr = 1
            prev_date = d
            if curr > best_streak:
                best_streak = curr

    best_streak = max(best_streak, current_streak)
    return current_streak, best_streak
