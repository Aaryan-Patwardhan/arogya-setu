"""
ArogyaSetu - Intelligent Sliding-Window Rate Limiter
Prevents Gemini API quota exhaustion while allowing 4-5 simultaneous users.
SPDX-FileCopyrightText: 2026 Aaryan Patwardhan
"""

import time
from collections import defaultdict
from typing import Tuple, Optional

class SlidingWindowRateLimiter:
    def __init__(
        self,
        max_global_per_minute: int = 15,
        max_per_ip_per_minute: int = 6,
        window_seconds: int = 60
    ):
        self.max_global = max_global_per_minute
        self.max_per_ip = max_per_ip_per_minute
        self.window_seconds = window_seconds
        
        self.global_requests = []
        self.ip_requests = defaultdict(list)

    def _cleanup(self, current_time: float):
        cutoff = current_time - self.window_seconds
        # Clean global timestamps
        self.global_requests = [t for t in self.global_requests if t > cutoff]
        
        # Clean per-IP timestamps
        stale_ips = []
        for ip, timestamps in self.ip_requests.items():
            valid = [t for t in timestamps if t > cutoff]
            if valid:
                self.ip_requests[ip] = valid
            else:
                stale_ips.append(ip)
        for ip in stale_ips:
            del self.ip_requests[ip]

    def check_and_consume(self, client_ip: str) -> Tuple[bool, Optional[str]]:
        """
        Check if request is allowed under rate limits:
        - Returns (True, None) if allowed.
        - Returns (False, reason) if rate limit reached.
        """
        now = time.time()
        self._cleanup(now)

        # 1. Check IP-specific rate limit (e.g. 6 requests / minute per client)
        if len(self.ip_requests[client_ip]) >= self.max_per_ip:
            return False, "ip_limit_reached"

        # 2. Check Global rate limit (e.g. 15 requests / minute across all concurrent users)
        if len(self.global_requests) >= self.max_global:
            return False, "global_limit_reached"

        # Record this request
        self.global_requests.append(now)
        self.ip_requests[client_ip].append(now)
        return True, None

    def get_stats(self) -> dict:
        now = time.time()
        self._cleanup(now)
        return {
            "current_global_rpm": len(self.global_requests),
            "max_global_rpm": self.max_global,
            "active_clients": len(self.ip_requests),
            "max_per_client_rpm": self.max_per_ip
        }

# Global singleton limiter
rate_limiter = SlidingWindowRateLimiter(
    max_global_per_minute=15, # Safe limit for standard Gemini Free Tier (15 RPM)
    max_per_ip_per_minute=6,   # Allows 1 request every 10s per user (supports 4-5 simultaneous users)
    window_seconds=60
)
