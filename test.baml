// Test BAML file
enum Status {
  Active
  Inactive
  Pending
}

class User {
  name string
  age int
  email string?
  status Status
}

function GetUser(id: int) -> User {
  client GPT4

  prompt #"
    Get user information for ID: {{ id }}
  "#
}

type UserID = int | string

let admin = "admin@example.com";
