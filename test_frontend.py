from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating...")

        # Will wait for the dashboard
        page.goto("http://localhost:3000/en/dashboard")
        time.sleep(5)

        page.screenshot(path="dashboard_verification.png", full_page=True)
        print("Screenshot captured")
        browser.close()

if __name__ == "__main__":
    run()
