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

export const update = async (req, res) => {
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
// UPDATE DRIVER LOCATION(x,y)
export const update_location = async (req, res) => {
  const driverId = req.params.id;
  const { lat, lon } = req.body;

  if (lat == null || lon == null) {
    return res.status(400).json({ error: "Missing lat or lon" });
  }

  const oldData = await Driver.findById(driverId);

  const newData = await Driver.findByIdAndUpdate(
    driverId,
    {
      $set: {
        "location.lat": lat,
        "location.lon": lon
      }
    },
    { new: true }  // return data mới
  );

  return res.json({
    status: "SUCCESS",
    old_lat: oldData.location.lat,
    old_lon: oldData.location.lon,
    new_lat: newData.location.lat,
    new_lon: newData.location.lon
  });
};

//==================//==================//==================//==================//==================
// NEARBY DRIVER LIST
export const get_nearby_list = async (req, res) => {
  const user_lat = Number(req.query.lat);
  const user_lon = Number(req.query.lon);

  if (user_lat == null || user_lon == null) {
    return res.status(400).json({ error: "Missing user lat/lon" });
  }

  // chỉ lấy drivers AVAILABLE
  const drivers = await Driver.find({ status: "available" });

  const result = [];

  for (const d of drivers) {
    // nếu driver chưa có location thì bỏ qua
    if (d.location.lat == null || d.location.lon == null) continue;

    const dx = d.location.lat - user_lat;
    const dy = d.location.lon - user_lon;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // chỉ lấy driver cách <= 15 đơn vị
    if (distance <= 15) {
      result.push({
        driver_id: d._id,
        lat: d.location.lat,
        lon: d.location.lon,
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
export const update_status = async (req, res) => {
    const driverId = req.params.id;
    const { status } = req.body;

  // invalid status string...
    const valid = ['available','busy','offline','assigned','coming','in_ride','completed'];

    if (!valid.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    await Driver.findByIdAndUpdate(
        driverId,
        {   
            $set: {
                "status": status,
            }
        },
        { new: true }  // return data mới
    );

  return res.json({ status: "SUCCESS"  });
};
//==================//==================//==================//==================//==================
export const ride_request = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { rideId } = req.body;

    // Kiểm tra input
    if (!rideId) {
      return res.status(400).json({ error: "Missing rideId" });
    }

    // Tìm driver theo id
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Chỉ nhận request nếu driver đang available
    if (driver.status !== "available" || driver.current_ride_id != null) {
      return res.status(400).json({ error: "Driver not available" });
    }

    // Cập nhật driver: status + current_ride_id
    driver.status = "assigned";
    driver.current_ride_id = rideId;

    await driver.save();

    // Trả kết quả
    return res.json({ result: "REQUEST_SENT" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//==================//==================//==================//==================//==================
export const update_ride_id = async (req, res) => {
    const driverId = req.params.id;
    const { current_ride_id } = req.body;

    await Driver.findByIdAndUpdate(
        driverId,
        {   
            $set: {
                "current_ride_id": current_ride_id,
            }
        },
        { new: true }  // return data mới
    );

  return res.json({ status: "SUCCESS"  });
};