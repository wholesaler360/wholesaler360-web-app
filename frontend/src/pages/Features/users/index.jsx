import { UsersController } from "./Users.control";
import { UsersComponent } from "./Users.component";

function Users() {
  return (
    <UsersController>
      <UsersComponent />
    </UsersController>
  );
}

export default Users;
