#!/usr/bin/env python3
"""
Simple HTTP fetcher for Node.js backend.
Bypasses some 403 by using realistic headers.
"""

import sys
import json
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup, NavigableString
import re

def safe_hostname(url):
    try:
        return urlparse(url).hostname.replace("www.", "") if urlparse(url).hostname else ""
    except:
        return ""

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_with_requests(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try to get title
        title = soup.find('title')
        title_text = title.get_text() if title else "Article"
        
        # Get main content - very basic but works on many sites
        article_text = ""
        for tag in ['article', 'main', '[role="main"]']:
            container = soup.select_one(tag)
            if container:
                paragraphs = container.find_all(['p', 'h1', 'h2', 'h3'])
                article_text = " ".join([p.get_text() for p in paragraphs if p.get_text().strip()])
                if len(article_text) > 100:
                    break
        
        if not article_text:
            paragraphs = soup.find_all('p')
            article_text = " ".join([p.get_text() for p in paragraphs[:15] if len(p.get_text().strip()) > 30])
        
        return {
            "title": clean_text(title_text),
            "text": clean_text(article_text),
            "html": "",
            "author": None,
            "sitename": safe_hostname(url),
            "hostname": safe_hostname(url),
            "final_url": response.url,
            "method": "requests"
        }
        
    except Exception as e:
        print(f"[extract] Error: {e}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL required"}))
        sys.exit(1)
    
    url = sys.argv[1]
    
    result = extract_with_requests(url)
    
    if result and len(result["text"]) > 100:
        print(json.dumps(result))
    else:
        print(json.dumps({
            "title": "Article partagé",
            "text": "Le contenu n'a pas pu être extrait automatiquement. Le titre et les recherches sont utilisés pour l'analyse.",
            "html": "",
            "author": None,
            "sitename": safe_hostname(url),
            "hostname": safe_hostname(url),
            "final_url": url,
            "method": "fallback"
        }))

if __name__ == "__main__":
    main()
