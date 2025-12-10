1. npm install each folder
2. docker-compose up --build to run
3. at 3-web-app: npm run dev


Chạy script:
Script 1: User đặt xe
Điền userId (lấy từ DB) và vị trí trong file 51.
Mở cmd mới “…\5-scripts> node 51-user-request-ride.js”.

Script 2: Driver đồng ý chuyến đi
Điền driverId và rideId (cả 2 lấy từ DB) trong file 52.
Mở cmd mới “…\5-scripts> node 52-assigned-driver-response.js”.

Script 3: Driver bắt đầu chở khách
Điền rideId (lấy từ DB) trong file 53.
Mở cmd mới “…\5-scripts> node 53-driver-pick-up.js”.

Script 4: Driver đến nơi, kết thúc chuyến đi, chờ khách thanh toán
Điền rideId (lấy từ DB) trong file 54.
Mở cmd mới “…\5-scripts> node 54-ride-finish.js”.

Script 5: User thanh toán 
Điền rideId (lấy từ DB) trong file 55.
Mở cmd mới “…\5-scripts> node 55-user-paying.js”.