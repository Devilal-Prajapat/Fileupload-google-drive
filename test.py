
import requests

json_data ={
    "folderName": "demo",
    "fileName": "test.txt",
    "fileContent": "hello from devilal",
    "userEmail":"devd.cmp@gmail.com"
}

url = "https://script.google.com/macros/s/<PUT Here your APP Script Depolyment Id>/exec"

res = requests.post(url,json=json_data)
print(res.status_code)
print(res.text)