const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (err) => {
  logger.error('未处理的Promise拒绝:', err);
});

app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false
}));
app.use(cors());
app.use(express.json());

const publicDir = path.resolve(__dirname, '../frontend/public');
const distDir = path.resolve(__dirname, '../frontend/dist');
const publicPath = fs.existsSync(publicDir) ? publicDir : distDir;
app.use(express.static(publicPath));

const JWT_SECRET = 'shipping_comparison_secret_2025';
let db;
let inMemoryUsers = [];
let inMemoryShipments = [];
let inMemoryUnlockRecords = [];

const initDatabase = () => {
  try {
    db = new sqlite3.Database('./shipping_comparison.db', (err) => {
      if (err) {
        logger.error('数据库连接失败:', err);
        return;
      }
      logger.info('数据库连接成功');
    });

    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance INTEGER DEFAULT 0,
        payment_method TEXT,
        email_verified INTEGER DEFAULT 0,
        verification_code TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      )`, (err) => {
        if (err) logger.error('创建users表失败:', err);
      });

      db.run(`CREATE TABLE IF NOT EXISTS shipments (
        id TEXT PRIMARY KEY,
        from_port TEXT NOT NULL,
        to_port TEXT NOT NULL,
        price REAL NOT NULL,
        container_type TEXT NOT NULL,
        container_quantity INTEGER NOT NULL,
        shipping_company TEXT NOT NULL,
        closing_date TEXT NOT NULL,
        eta TEXT NOT NULL,
        valid_until TEXT NOT NULL,
        submitter_id TEXT NOT NULL,
        submitter_contact TEXT NOT NULL,
        status TEXT DEFAULT 'active',\n        created_at TEXT DEFAULT (datetime('now', 'localtime')),\n        FOREIGN KEY(submitter_id) REFERENCES users(id)\n      )`, (err) => {
        if (err) logger.error('创建shipments表失败:', err);
      });

      db.run(`CREATE TABLE IF NOT EXISTS unlock_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        shipment_id TEXT NOT NULL,
        credits_used INTEGER DEFAULT 3,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(shipment_id) REFERENCES shipments(id)
      )`, (err) => {
        if (err) logger.error('创建unlock_records表失败:', err);
      });

      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT OR IGNORE INTO users (id, phone, email, password, balance, email_verified) 
        VALUES ('admin-001', '13800138000', 'admin@shipping.com', ?, 1000, 1)`, [adminPassword], (err) => {
        if (err) logger.error('插入管理员账户失败:', err);
      });

      const exampleShipments = [
        {
          id: 'example-001',
          from_port: '上海',
          to_port: '洛杉矶',
          price: 1200,
          container_type: '40HQ',
          container_quantity: 5,
          shipping_company: '中远海运',
          closing_date: '2025-12-20',
          eta: '2026-01-10',
          valid_until: '2025-12-25',
          submitter_id: 'admin-001',
          submitter_contact: '13800138000'
        },
        {
          id: 'example-002',
          from_port: '深圳',
          to_port: '纽约',
          price: 1580,
          container_type: '40GP',
          container_quantity: 3,
          shipping_company: '马士基',
          closing_date: '2025-12-22',
          eta: '2026-01-15',
          valid_until: '2025-12-28',
          submitter_id: 'admin-001',
          submitter_contact: '13800138000'
        },
        {
          id: 'example-003',
          from_port: '宁波',
          to_port: '鹿特丹',
          price: 2100,
          container_type: '20GP',
          container_quantity: 10,
          shipping_company: '达飞轮船',
          closing_date: '2025-12-18',
          eta: '2026-01-20',
          valid_until: '2025-12-23',
          submitter_id: 'admin-001',
          submitter_contact: '13800138000'
        },
        {
          id: 'example-004',
          from_port: '青岛',
          to_port: '汉堡',
          price: 1950,
          container_type: '40HQ',
          container_quantity: 8,
          shipping_company: '赫伯罗特',
          closing_date: '2025-12-25',
          eta: '2026-01-25',
          valid_until: '2025-12-30',
          submitter_id: 'admin-001',
          submitter_contact: '13800138000'
        },
        {
          id: 'example-005',
          from_port: '天津',
          to_port: '悉尼',
          price: 1380,
          container_type: '20RF',
          container_quantity: 2,
          shipping_company: '东方海外',
          closing_date: '2025-12-19',
          eta: '2026-01-08',
          valid_until: '2025-12-24',
          submitter_id: 'admin-001',
          submitter_contact: '13800138000'
        }
      ];

      exampleShipments.forEach(shipment => {
        db.run(`INSERT OR IGNORE INTO shipments (id, from_port, to_port, price, container_type, 
          container_quantity, shipping_company, closing_date, eta, valid_until, submitter_id, submitter_contact) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [shipment.id, shipment.from_port, shipment.to_port, shipment.price, shipment.container_type,
           shipment.container_quantity, shipment.shipping_company, shipment.closing_date, shipment.eta,
           shipment.valid_until, shipment.submitter_id, shipment.submitter_contact],
          (err) => {
            if (err) logger.error('插入范例数据失败:', err);
          }
        );
      });
    });
  } catch (error) {
    logger.error('数据库初始化失败:', error);
  }
};

initDatabase();

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'demo@qq.com',
    pass: process.env.EMAIL_PASS || 'demo_password'
  }
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'demo@qq.com',
      to: email,
      subject: '国际海运实时现舱 - 邮箱验证码',
      html: `<div style="padding:20px;background:#f5f5f5">
        <div style="max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:8px">
          <h2 style="color:#1a5490">国际海运实时现舱 By HAISNAP</h2>
          <p>您的验证码是：</p>
          <h1 style="color:#d4af37;letter-spacing:5px">${code}</h1>
          <p style="color:#666">验证码有效期为10分钟，请勿泄露给他人。</p>
        </div>
      </div>`
    });
    return true;
  } catch (error) {
    logger.error('邮件发送失败:', error);
    return false;
  }
};

app.post('/api/register', async (req, res) => {
  const { phone, email, password } = req.body;

  if (!phone || !email || !password) {
    return res.status(400).json({ success: false, message: '请填写完整信息' });
  }

  const verificationCode = generateVerificationCode();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = uuidv4();

  if (!db) {
    const existingUser = inMemoryUsers.find(u => u.phone === phone || u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '手机号或邮箱已被注册' });
    }
    
    inMemoryUsers.push({
      id: userId,
      phone,
      email,
      password: hashedPassword,
      balance: 0,
      email_verified: 0,
      verification_code: verificationCode
    });
    
    return res.json({ success: true, message: '验证码已发送至邮箱', userId });
  }

  db.get('SELECT * FROM users WHERE phone = ? OR email = ?', [phone, email], async (err, row) => {
    if (err) {
      logger.error('数据库查询异常:', err);
      return res.status(500).json({ success: false, message: '数据库异常' });
    }
    if (row) {
      return res.status(400).json({ success: false, message: '手机号或邮箱已被注册' });
    }

    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      return res.status(500).json({ success: false, message: '验证码发送失败，请检查邮箱' });
    }

    db.run(
      'INSERT INTO users (id, phone, email, password, verification_code) VALUES (?, ?, ?, ?, ?)',
      [userId, phone, email, hashedPassword, verificationCode],
      (err) => {
        if (err) {
          logger.error('用户注册失败:', err);
          return res.status(500).json({ success: false, message: '注册失败' });
        }
        res.json({ success: true, message: '验证码已发送至邮箱', userId });
      }
    );
  });
});

app.post('/api/verify-email', (req, res) => {
  const { userId, code } = req.body;

  if (!db) {
    const user = inMemoryUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(400).json({ success: false, message: '用户不存在' });
    }
    if (user.verification_code !== code) {
      return res.status(400).json({ success: false, message: '验证码错误' });
    }
    user.email_verified = 1;
    user.verification_code = null;
    return res.json({ success: true, message: '邮箱验证成功' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      logger.error('用户查询异常:', err);
      return res.status(400).json({ success: false, message: '用户不存在' });
    }
    if (user.verification_code !== code) {
      return res.status(400).json({ success: false, message: '验证码错误' });
    }

    db.run('UPDATE users SET email_verified = 1, verification_code = NULL WHERE id = ?', [userId], (err) => {
      if (err) {
        logger.error('邮箱验证失败:', err);
        return res.status(500).json({ success: false, message: '验证失败' });
      }
      res.json({ success: true, message: '邮箱验证成功' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { account, password } = req.body;

  if (!db) {
    const user = inMemoryUsers.find(u => u.phone === account || u.email === account);
    if (!user) {
      return res.status(400).json({ success: false, message: '账号不存在' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ success: false, message: '密码错误' });
    }
    if (user.email_verified === 0) {
      return res.status(400).json({ success: false, message: '请先完成邮箱验证' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        balance: user.balance
      }
    });
  }

  db.get('SELECT * FROM users WHERE phone = ? OR email = ?', [account, account], (err, user) => {
    if (err) {
      logger.error('数据库查询异常:', err);
      return res.status(500).json({ success: false, message: '数据库异常' });
    }
    if (!user) {
      return res.status(400).json({ success: false, message: '账号不存在' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ success: false, message: '密码错误' });
    }
    if (user.email_verified === 0) {
      return res.status(400).json({ success: false, message: '请先完成邮箱验证' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        balance: user.balance
      }
    });
  });
});

// 新增：获取用户积分余额接口
app.get('/api/getBalance', (req, res) => {
  let userId = null;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      // Token 无效或过期，尝试从参数获取(仅用于特定兼容场景)
    }
  }

  // 兼容直接传参方式
  if (!userId && req.query.userId) {
    userId = req.query.userId;
  }

  if (!userId) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  if (!db) {
    const user = inMemoryUsers.find(u => u.id === userId);
    return res.json({ success: true, balance: user ? user.balance : 0 });
  }

  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      logger.error('获取余额失败:', err);
      return res.status(500).json({ success: false, message: '获取余额失败' });
    }
    res.json({ success: true, balance: row ? row.balance : 0 });
  });
});

// 新增：请求绑定支付方式接口
app.post('/api/requestPaymentBinding', (req, res) => {
  let userId = null;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      // Token 无效
    }
  }

  if (!userId && req.body.userId) {
    userId = req.body.userId;
  }

  if (!userId) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  const { paymentType } = req.body;
  if (!['wechat', 'alipay'].includes(paymentType)) {
    return res.status(400).json({ success: false, message: '不支持的支付方式' });
  }

  const updateBinding = (callback) => {
    if (!db) {
      const user = inMemoryUsers.find(u => u.id === userId);
      if (user) user.payment_method = paymentType;
      callback(null);
    } else {
      db.run('UPDATE users SET payment_method = ? WHERE id = ?', [paymentType, userId], (err) => {
        callback(err);
      });
    }
  };

  updateBinding((err) => {
    if (err) {
      logger.error('绑定支付方式失败:', err);
      return res.status(500).json({ success: false, message: '绑定失败，请稍后重试' });
    }
    res.json({ 
      success: true, 
      message: `请前往${paymentType === 'wechat' ? '微信' : '支付宝'}完成授权绑定`,
      bindStatus: 'pending'
    });
  });
});

app.get('/api/search', (req, res) => {
  const { from_port, to_port, page = 1 } = req.query;
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!db) {
    let results = inMemoryShipments.filter(s => s.status === 'active');
    if (from_port) {
      results = results.filter(s => s.from_port.includes(from_port));
    }
    if (to_port) {
      results = results.filter(s => s.to_port.includes(to_port));
    }
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const total = results.length;
    const data = results.slice(offset, offset + limit);
    return res.json({
      success: true,
      data: data,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  }

  let query = 'SELECT * FROM shipments WHERE status = "active"';
  const params = [];

  if (from_port) {
    query += ' AND from_port LIKE ?';
    params.push(`%${from_port}%`);
  }
  if (to_port) {
    query += ' AND to_port LIKE ?';
    params.push(`%${to_port}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      logger.error('舱位搜索异常:', err);
      return res.status(500).json({ success: false, message: '数据库异常' });
    }

    let countQuery = 'SELECT COUNT(*) as total FROM shipments WHERE status = "active"';
    const countParams = [];
    
    if (from_port) {
      countQuery += ' AND from_port LIKE ?';
      countParams.push(`%${from_port}%`);
    }
    if (to_port) {
      countQuery += ' AND to_port LIKE ?';
      countParams.push(`%${to_port}%`);
    }

    db.get(countQuery, countParams, (err, count) => {
      res.json({
        success: true,
        data: rows || [],
        total: count ? count.total : 0,
        page: parseInt(page),
        totalPages: Math.ceil((count ? count.total : 0) / limit)
      });
    });
  });
});

app.get('/api/shipment/:id', (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  const processShipment = (shipment, userId) => {
    if (!shipment) {
      return res.status(404).json({ success: false, message: '舱位不存在' });
    }

    const checkUnlock = (callback) => {
      if (!db) {
        const record = inMemoryUnlockRecords.find(r => r.user_id === userId && r.shipment_id === id);
        callback(!!record);
      } else {
        db.get('SELECT * FROM unlock_records WHERE user_id = ? AND shipment_id = ?', 
          [userId, id], (err, record) => {
            callback(!!record);
        });
      }
    };

    if (userId) {
      checkUnlock((isUnlocked) => {
        const isSubmitter = shipment.submitter_id === userId;
        const canViewContact = isUnlocked || isSubmitter;

        res.json({
          success: true,
          data: {
            id: shipment.id,
            from_port: shipment.from_port,
            to_port: shipment.to_port,
            price: shipment.price,
            container_type: shipment.container_type,
            container_quantity: shipment.container_quantity,
            shipping_company: shipment.shipping_company,
            closing_date: shipment.closing_date,
            eta: shipment.eta,
            valid_until: shipment.valid_until,
            submitter_contact: canViewContact ? shipment.submitter_contact : null,
            isUnlocked: canViewContact
          }
        });
      });
    } else {
      res.json({
        success: true,
        data: {
          id: shipment.id,
          from_port: shipment.from_port,
          to_port: shipment.to_port,
          price: shipment.price,
          container_type: shipment.container_type,
          container_quantity: shipment.container_quantity,
          shipping_company: shipment.shipping_company,
          closing_date: shipment.closing_date,
          eta: shipment.eta,
          valid_until: shipment.valid_until,
          submitter_contact: null,
          isUnlocked: false
        }
      });
    }
  };

  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      logger.error('Token验证失败:', error);
    }
  }

  if (!db) {
    const shipment = inMemoryShipments.find(s => s.id === id && s.status === 'active');
    processShipment(shipment, userId);
  } else {
    db.get('SELECT * FROM shipments WHERE id = ? AND status = "active"', [id], (err, shipment) => {
      if (err) {
        logger.error('舱位查询异常:', err);
        return res.status(500).json({ success: false, message: '数据库异常' });
      }
      processShipment(shipment, userId);
    });
  }
});

app.post('/api/unlock-contact', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { shipment_id } = req.body;

    if (!shipment_id) {
      return res.status(400).json({ success: false, message: '缺少舱位ID' });
    }

    const processUnlock = (user) => {
      if (!user) {
        return res.status(400).json({ success: false, message: '用户不存在' });
      }
      if (user.balance < 3) {
        return res.status(400).json({ success: false, message: '积分余额不足' });
      }

      const checkRecord = (callback) => {
        if (!db) {
          const record = inMemoryUnlockRecords.find(r => 
            r.user_id === decoded.userId && r.shipment_id === shipment_id
          );
          callback(record);
        } else {
          db.get('SELECT * FROM unlock_records WHERE user_id = ? AND shipment_id = ?', 
            [decoded.userId, shipment_id], (err, record) => {
              callback(record);
          });
        }
      };

      checkRecord((record) => {
        if (record) {
          const getContact = (callback) => {
            if (!db) {
              const shipment = inMemoryShipments.find(s => s.id === shipment_id);
              callback(shipment ? shipment.submitter_contact : null);
            } else {
              db.get('SELECT submitter_contact FROM shipments WHERE id = ?', [shipment_id], (err, shipment) => {
                callback(shipment ? shipment.submitter_contact : null);
              });
            }
          };

          getContact((contact) => {
            return res.json({ 
              success: true, 
              contact: contact, 
              message: '已解锁',
              newBalance: user.balance
            });
          });
          return;
        }

        const updateBalance = (callback) => {
          if (!db) {
            user.balance -= 3;
            callback();
          } else {
            db.run('UPDATE users SET balance = balance - 3 WHERE id = ?', [decoded.userId], (err) => {
              if (err) {
                logger.error('更新余额失败:', err);
                return res.status(500).json({ success: false, message: '支付失败' });
              }
              callback();
            });
          }
        };

        updateBalance(() => {
          const recordId = uuidv4();
          const insertRecord = (callback) => {
            if (!db) {
              inMemoryUnlockRecords.push({
                id: recordId,
                user_id: decoded.userId,
                shipment_id: shipment_id,
                credits_used: 3
              });
              callback();
            } else {
              db.run('INSERT INTO unlock_records (id, user_id, shipment_id) VALUES (?, ?, ?)',
                [recordId, decoded.userId, shipment_id], (err) => {
                if (err) {
                  logger.error('插入解锁记录失败:', err);
                  return res.status(500).json({ success: false, message: '记录失败' });
                }
                callback();
              });
            }
          };

          insertRecord(() => {
            const getContact = (callback) => {
              if (!db) {
                const shipment = inMemoryShipments.find(s => s.id === shipment_id);
                callback(shipment ? shipment.submitter_contact : null);
              } else {
                db.get('SELECT submitter_contact FROM shipments WHERE id = ?', [shipment_id], (err, shipment) => {
                  callback(shipment ? shipment.submitter_contact : null);
                });
              }
            };

            getContact((contact) => {
              res.json({ 
                success: true, 
                contact: contact, 
                newBalance: user.balance - 3,
                message: '解锁成功'
              });
            });
          });
        });
      });
    };

    if (!db) {
      const user = inMemoryUsers.find(u => u.id === decoded.userId);
      processUnlock(user);
    } else {
      db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
        if (err) {
          logger.error('用户查询异常:', err);
          return res.status(400).json({ success: false, message: '用户不存在' });
        }
        processUnlock(user);
      });
    }
  } catch (error) {
    logger.error('Token验证失败:', error);
    res.status(401).json({ success: false, message: '登录已过期' });
  }
});

app.post('/api/recharge', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { amount } = req.body;

    if (amount < 150) {
      return res.status(400).json({ success: false, message: '最低充值150元' });
    }

    if (!db) {
      const user = inMemoryUsers.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(400).json({ success: false, message: '用户不存在' });
      }
      user.balance += amount;
      return res.json({ success: true, balance: user.balance, message: '充值成功' });
    }

    db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, decoded.userId], (err) => {
      if (err) {
        logger.error('充值失败:', err);
        return res.status(500).json({ success: false, message: '充值失败' });
      }

      db.get('SELECT balance FROM users WHERE id = ?', [decoded.userId], (err, user) => {
        if (err) {
          logger.error('查询余额失败:', err);
          return res.status(500).json({ success: false, message: '数据库异常' });
        }
        res.json({ success: true, balance: user.balance, message: '充值成功' });
      });
    });
  } catch (error) {
    logger.error('Token验证失败:', error);
    res.status(401).json({ success: false, message: '登录已过期' });
  }
});

app.get('/api/user/info', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!db) {
      const user = inMemoryUsers.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(400).json({ success: false, message: '用户不存在' });
      }
      return res.json({ 
        success: true, 
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          balance: user.balance
        }
      });
    }

    db.get('SELECT id, phone, email, balance FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        logger.error('用户查询异常:', err);
        return res.status(400).json({ success: false, message: '用户不存在' });
      }
      res.json({ success: true, user });
    });
  } catch (error) {
    logger.error('Token验证失败:', error);
    res.status(401).json({ success: false, message: '登录已过期' });
  }
});

app.post('/api/publish', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    const { 
      from_port, to_port, price, container_type, 
      container_quantity, shipping_company, closing_date, 
      eta, valid_until, submitter_contact 
    } = req.body;

    if (!from_port || !to_port || !price || !container_type || !shipping_company || !submitter_contact) {
      return res.status(400).json({ success: false, message: '请填写必要信息' });
    }

    const shipmentId = uuidv4();
    const newShipment = {
      id: shipmentId,
      from_port,
      to_port,
      price: parseFloat(price),
      container_type,
      container_quantity: parseInt(container_quantity) || 1,
      shipping_company,
      closing_date,
      eta,
      valid_until,
      submitter_id: userId,
      submitter_contact,
      status: 'active',
      created_at: new Date().toISOString()
    };

    if (!db) {
      inMemoryShipments.unshift(newShipment);
      return res.json({ success: true, message: '发布成功', shipmentId });
    }

    db.run(`INSERT INTO shipments (
      id, from_port, to_port, price, container_type, 
      container_quantity, shipping_company, closing_date, eta, 
      valid_until, submitter_id, submitter_contact
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newShipment.id, newShipment.from_port, newShipment.to_port, 
      newShipment.price, newShipment.container_type, newShipment.container_quantity, 
      newShipment.shipping_company, newShipment.closing_date, newShipment.eta, 
      newShipment.valid_until, newShipment.submitter_id, newShipment.submitter_contact
    ],
    (err) => {
      if (err) {
        logger.error('发布舱位失败:', err);
        return res.status(500).json({ success: false, message: '发布失败' });
      }
      res.json({ success: true, message: '发布成功', shipmentId });
    });

  } catch (error) {
    logger.error('Token验证失败或发布异常:', error);
    res.status(401).json({ success: false, message: '登录已过期或无效' });
  }
});

app.get('*', (req, res) => {
  const filePath = path.join(publicPath, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ success: false, message: '页面不存在' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`国际海运实时现舱服务已启动，端口: ${PORT}`);
});