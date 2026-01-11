import Driver from '../models/driver.model.js'

export const getAll = async (req, res) => {
    const drivers = await Driver.find();
    res.json(drivers);
};

export const create = async (req, res) => {
    const newDriver = new Driver(req.body);
    await newDriver.save();
    res.json(newDriver);
};


// Không kiểm soát logic trạng thái (1->3->2)
// Nếu id không tồn tại → driver = null
// 1.2 script 1
export const update = async (req, res) => {
  // Xử lý: không cho update BẤT KỲ field nào nếu client gửi lên
  const allowed = ['status', 'current_ride_id', 'location']

  const payload = {}
  for (const k of allowed) {
    if (req.body[k] !== undefined) payload[k] = req.body[k]
  }

    const driver = await Driver.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {new: true}
    )
    res.json(driver)
}



export const health = (req, res) => {
    res.json({ service: 'driver-service', status: 'healthy' });
}

export const getOne = async (req, res) => {
    const driver = await Driver.findById(req.params.id)
    if(!driver) return res.status(404).json({message: "Not found"})
    res.json(driver)
}

export const remove = async (req, res) => {
    const driver = await Driver.findByIdAndDelete(req.params.id)
    if(!driver) return res.status(404).json({message: "Not found"})
    res.json({message: "Deleted"})
}

//==================//==================//==================//==================//==================

//==================//==================//==================//==================//==================
// 1.3 script 1
// NEARBY DRIVER LIST
export const get_nearby_list = async (req, res) => {
  const user_x = Number(req.query.x);
  const user_y = Number(req.query.y);

  if (user_x == null || user_y == null) {
    return res.status(400).json({ error: "Missing user location" });
  }

  // chỉ lấy drivers AVAILABLE
  const drivers = await Driver.find({ status: "AVAILABLE" });

  const result = [];

  for (const d of drivers) {
    // nếu driver chưa có location thì bỏ qua
    if (d.location.x == null || d.location.y == null) continue;

    const dx = d.location.x - user_x;
    const dy = d.location.y - user_y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // chỉ lấy driver cách <= 15 đơn vị
    if (distance <= 10000) {
      result.push({
        driverId: d._id,
        distance
      });
    }
  }

  // sort theo khoảng cách tăng dần
  result.sort((a, b) => a.distance - b.distance);

  return res.json({
    count: result.length,
    nearby_drivers: result
  });
}



//==================//==================//==================//==================//==================
//==================//==================//==================//==================//==================
//==================//==================//==================//==================//==================
