import request from "supertest";
import app from "../../app";

describe("Auth API", () => {
  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "Test123!" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
