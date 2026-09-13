export const getHealth = (req, res) => {
  res.json({
    status: 'online',
    service: 'Node.js Gateway',
    timestamp: new Date().toISOString()
  });
};
