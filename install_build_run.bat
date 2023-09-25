cd client
call npm install
call npm run build
cd ../
cd server
call pip install -r requirements.txt
call python server.py
cd ../
