from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating...")

        # Go to home instead to avoid complex auth redirects for local testing
        page.goto("http://localhost:3000/", timeout=60000)
        time.sleep(5)

        page.screenshot(path="dashboard_verification.png", full_page=True)
        print("Screenshot captured")
        browser.close()

if __name__ == "__main__":
    run()
