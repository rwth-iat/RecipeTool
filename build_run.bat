cd client
call npm run build
cd ../
cd server
call pip install -r requirements.txt
call python app.py
cd ../
