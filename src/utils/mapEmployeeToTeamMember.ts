// utils/mapEmployeeToTeamMember.ts

import { Employee } from "../../types/company";
import { TeamMember } from "../../types/TeamMember";

export const mapEmployeeToTeamMember = (employee: Employee): TeamMember  => ({
  id: employee.id,
  name: employee.name,
  surname: employee.surname,
  email: employee.email,
  phone: employee.phone,
  role: employee.role,
  tags: null,
  member: "",
});
