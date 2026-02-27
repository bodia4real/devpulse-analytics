import { errorHandler } from '../middleware/errorHandler';

describe('Error Handler', () => {
  it('returns 500 for generic errors', () => {
    const err = new Error('Test error');
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // silence console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Test error',
    });

    consoleSpy.mockRestore();
  });
});