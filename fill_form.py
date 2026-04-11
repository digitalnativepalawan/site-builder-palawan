from selenium import webdriver
from selenium.webdriver.common.by import By
import time

driver = webdriver.Firefox()
driver.get('file:///home/davidlesmith/site-builder-palawan/resort-form.html')
time.sleep(3)

driver.find_element(By.NAME, 'resort_name').send_keys('Palawan Sunset Resort')
driver.find_element(By.NAME, 'tagline').send_keys('Paradise Found')
driver.find_element(By.NAME, 'short_description').send_keys('Beautiful beachfront resort')
driver.find_element(By.NAME, 'full_description').send_keys('Luxury resort with pool and restaurant')
driver.find_element(By.NAME, 'contact_email').send_keys('test@resort.com')
driver.find_element(By.NAME, 'phone_number').send_keys('09123456789')
driver.find_element(By.NAME, 'publish_immediately').click()

driver.find_element(By.XPATH, "//button[contains(text(), 'Submit')]").click()
time.sleep(3)
print('Submitted!')
driver.quit()
