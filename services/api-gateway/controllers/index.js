export const getGatewayStatus = (req, res) => {
  res.json({ message: 'API Gateway is routing requests.' });
};

export const notImplemented = (req, res) => {
  // TODO: Add API gateway-specific orchestration handlers if route aggregation is needed.
  res.status(501).json({ message: 'Not implemented.' });
};
