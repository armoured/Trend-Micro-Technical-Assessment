const { CostExplorer } = require("aws-sdk");
var AWS = require("aws-sdk-mock");
var UserManager = require("./manager");

const users_before = [
  {
    firstname: "Mitchell",
    lastname: "Shelton",
    username: "mitty",
    email: "mitchellshelton979@gmail.com",
    credentials: "password",
  },
  {
    firstname: "John",
    lastname: "Citizen",
    username: "Johny",
    email: "john@gmail.com",
    credentials: "password1234",
  },
  {
    firstname: "Keanu",
    lastname: "Reeves",
    username: "john wick",
    email: "keanu.reeves@gmail.com",
    credentials: "password0987",
  },
];

const database = [
  {
    firstname: "Mitchell",
    lastname: "Shelton",
    username: "mitty",
    email: "mitchellshelton979@gmail.com",
    id: "d399d7bc-021d-4138-80ac-286d2d6b4e4e",
    type: "user",
    credentials:
      "AQICAHjQ7sViXQdeS4wWbFZpkOQWvCdNXqiy4Cnz0/xEBe39SQGz0vofeAo0+SyOXv172fqkAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMhchHh0ugGzwRTC4gAgEQgCMlkhYlCYk2SfYIkfQ6ruwA71KBcN7ih/OPzSE86OT/eBOz3Q==",
  },
  {
    firstname: "John",
    lastname: "Citizen",
    username: "Johny",
    email: "john@gmail.com",
    id: "k4gk4i9v-49cd-42gd-42dk-smbor349fmsr",
    type: "user",
    credentials:
      "ACICAHjQ7sViXQdeS4wWbFZpkOQWvCdNXqiy4Cnz0/xEBe39SQGz0vofeAo0+SyOXv172fqkAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMhchHh0ugGzwRTC4gAgEQgCMlkhYlCYk2SfYIkfQ6ruwA71KBcN7ih/OPzSE86OT/eBOz3Q==",
  },
  {
    firstname: "Keanu",
    lastname: "Reeves",
    username: "john wick",
    email: "keanu.reeves@gmail.com",
    id: "fgu593md-r8mf-475d-gksl-vme93tife3rf",
    type: "user",
    credentials:
      "ADICAHjQ7sViXQdeS4wWbFZpkOQWvCdNXqiy4Cnz0/xEBe39SQGz0vofeAo0+SyOXv172fqkAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMhchHh0ugGzwRTC4gAgEQgCMlkhYlCYk2SfYIkfQ6ruwA71KBcN7ih/OPzSE86OT/eBOz3Q==",
  },
];

test("get users successfully", async (done) => {
  // emulate write only credentials (i.e. remove credentials from read)
  var filtered_db = database.map(({ credentials, ...rest }) => rest);

  AWS.mock("DynamoDB.DocumentClient", "scan", function (params, callback) {
    callback(null, { Items: filtered_db });
  });

  const event = {};
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(200);
      expect(body).toEqual({ data: { Items: filtered_db } });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("get_users", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
});

test("create user successfully", async (done) => {
  var user_before = users_before[0];

  AWS.mock("DynamoDB.DocumentClient", "query", function (params, callback) {
    // User doesn't exist yet
    callback(null, { Items: [], Count: 0, ScannedCount: 0 });
  });

  AWS.mock("KMS", "createKey", function (params, callback) {
    callback(null, {
      KeyMetadata: { KeyId: "1234abcd-12ab-34cd-56ef-1234567890ab" },
    });
  });

  AWS.mock("KMS", "encrypt", function (params, callback) {
    callback(null, { CiphertextBlob: "encrypted-password" });
  });

  AWS.mock("DynamoDB.DocumentClient", "put", function (params, callback) {
    callback(null, {});
  });

  const event = {
    body: JSON.stringify(user_before),
  };
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(201);
      expect(body.data.firstname).toEqual(user_before.firstname);
      expect(body.data.lastname).toEqual(user_before.lastname);
      expect(body.data.email).toEqual(user_before.email);
      expect(body.data.username).toEqual(user_before.username);
      expect(body.data).toEqual(
        expect.not.objectContaining({ credentials: expect.any(String) })
      );
      expect(body.data).toEqual(
        expect.objectContaining({ id: expect.any(String) })
      );
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("create_user", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
  AWS.restore("KMS");
});

test("create user already exists", async (done) => {
  var user_before = users_before[0];
  var { credentials, ...user_after } = database[0];

  AWS.mock("DynamoDB.DocumentClient", "query", function (params, callback) {
    // user already exists
    callback(null, { Items: [{ user_after }], Count: 1, ScannedCount: 1 });
  });

  // below are mocked just so we don't call aws if
  // the the test somehow gets past the email check
  AWS.mock("KMS", "createKey", function (params, callback) {
    callback(null, {});
  });

  AWS.mock("KMS", "encrypt", function (params, callback) {
    callback(null, {});
  });

  AWS.mock("DynamoDB.DocumentClient", "put", function (params, callback) {
    callback(null, {});
  });

  const event = {
    body: JSON.stringify(user_before),
  };
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(400);
      expect(body).toEqual({
        errors: [{ errorMessage: "User Already Exists" }],
      });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("create_user", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
  AWS.restore("KMS");
});

test("create user invalid email format", async (done) => {
  // copy the user because we are changing the email
  var user = Object.assign({}, users_before[0]);
  user.email = "mitchgmail.com";

  // below are mocked just so we don't call aws if
  // the test somehow gets past the parameter check
  AWS.mock("DynamoDB.DocumentClient", "query", function (params, callback) {
    callback(null, {});
  });

  AWS.mock("KMS", "createKey", function (params, callback) {
    callback(null, {});
  });

  AWS.mock("KMS", "encrypt", function (params, callback) {
    callback(null, {});
  });

  AWS.mock("DynamoDB.DocumentClient", "put", function (params, callback) {
    callback(null, {});
  });

  const event = {
    body: JSON.stringify(user),
  };
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(400);
      expect(body).toEqual({
        errors: [{ errorMessage: "Invalid Email Format" }],
      });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("create_user", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
  AWS.restore("KMS");
});

test("create user missing parameters", async (done) => {
  var user = {};

  // below are mocked just so we don't call aws if
  // the test somehow gets past the parameter check
  AWS.mock("DynamoDB.DocumentClient", "query", function (params, callback) {
    callback(null, {});
  });

  AWS.mock("KMS", "createKey", function (params, callback) {
    callback(null, {});
  });

  AWS.mock("KMS", "encrypt", function (params, callback) {
    callback(null, {});
  });

  AWS.mock("DynamoDB.DocumentClient", "put", function (params, callback) {
    callback(null, {});
  });

  const event = {
    body: JSON.stringify(user),
  };
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(400);
      expect(body).toEqual({
        errors: [{ errorMessage: "Missing key firstname in body" }],
      });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("create_user", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
  AWS.restore("KMS");
});

// AWS fail Checks

test("get users scan fail", async (done) => {
  AWS.mock("DynamoDB.DocumentClient", "scan", function (params, callback) {
    callback({ statusCode: 400, code: "Scan Failed" }, null);
  });

  const event = {};
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(400);
      expect(body).toEqual({ errors: [{ errorMessage: "Scan Failed" }] });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("get_users", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
});

test("create user query email fail", async (done) => {
  var user = users_before[0];

  AWS.mock("DynamoDB.DocumentClient", "query", function (params, callback) {
    callback({ statusCode: 400, code: "Query Email Failed" }, null);
  });

  AWS.mock("KMS", "createKey", function (params, callback) {
    callback(null, {
      KeyMetadata: { KeyId: "1234abcd-12ab-34cd-56ef-1234567890ab" },
    });
  });

  AWS.mock("KMS", "encrypt", function (params, callback) {
    callback(null, { CiphertextBlob: "encrypted-password" });
  });

  AWS.mock("DynamoDB.DocumentClient", "put", function (params, callback) {
    callback(null, {});
  });

  const event = {
    body: JSON.stringify(user),
  };
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(400);
      expect(body).toEqual({
        errors: [{ errorMessage: "Query Email Failed" }],
      });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("create_user", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
  AWS.restore("KMS");
});

test("create user create kms key fail", async (done) => {
  var user = users_before[0];

  AWS.mock("DynamoDB.DocumentClient", "query", function (params, callback) {
    callback(null, { Items: [], Count: 0, ScannedCount: 0 });
  });

  AWS.mock("KMS", "createKey", function (params, callback) {
    callback({ statusCode: 400, code: "KMS Create Key Failed" }, null);
  });

  AWS.mock("KMS", "encrypt", function (params, callback) {
    callback(null, { CiphertextBlob: "encrypted-password" });
  });

  AWS.mock("DynamoDB.DocumentClient", "put", function (params, callback) {
    callback(null, {});
  });

  const event = {
    body: JSON.stringify(user),
  };
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(400);
      expect(body).toEqual({
        errors: [{ errorMessage: "KMS Create Key Failed" }],
      });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("create_user", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
  AWS.restore("KMS");
});

test("create user encrypt kms credentials fail", async (done) => {
  var user = users_before[0];

  AWS.mock("DynamoDB.DocumentClient", "query", function (params, callback) {
    callback(null, { Items: [], Count: 0, ScannedCount: 0 });
  });

  AWS.mock("KMS", "createKey", function (params, callback) {
    callback(null, {
      KeyMetadata: { KeyId: "1234abcd-12ab-34cd-56ef-1234567890ab" },
    });
  });

  AWS.mock("KMS", "encrypt", function (params, callback) {
    callback({ statusCode: 400, code: "KMS Encrypt Credentials Failed" }, null);
  });

  AWS.mock("DynamoDB.DocumentClient", "put", function (params, callback) {
    callback(null, {});
  });

  const event = {
    body: JSON.stringify(user),
  };
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(400);
      expect(body).toEqual({
        errors: [{ errorMessage: "KMS Encrypt Credentials Failed" }],
      });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("create_user", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
  AWS.restore("KMS");
});

test("create user put user fail", async (done) => {
  var user = users_before[0];

  AWS.mock("DynamoDB.DocumentClient", "query", function (params, callback) {
    callback(null, { Items: [], Count: 0, ScannedCount: 0 });
  });

  AWS.mock("KMS", "createKey", function (params, callback) {
    callback(null, {
      KeyMetadata: { KeyId: "1234abcd-12ab-34cd-56ef-1234567890ab" },
    });
  });

  AWS.mock("KMS", "encrypt", function (params, callback) {
    callback(null, { CiphertextBlob: "encrypted-password" });
  });

  AWS.mock("DynamoDB.DocumentClient", "put", function (params, callback) {
    callback({ statusCode: 400, code: "DynamoDB Put User Failed" }, null);
  });

  const event = {
    body: JSON.stringify(user),
  };
  var callback = (err, data) => {
    try {
      const body = JSON.parse(data.body);
      expect(err).toEqual(null);
      expect(data.statusCode).toEqual(400);
      expect(body).toEqual({
        errors: [{ errorMessage: "DynamoDB Put User Failed" }],
      });
      done();
    } catch (error) {
      done(error);
    }
  };

  var user_manager = new UserManager();

  await user_manager.dispatch("create_user", event, callback);

  AWS.restore("DynamoDB.DocumentClient");
  AWS.restore("KMS");
});
