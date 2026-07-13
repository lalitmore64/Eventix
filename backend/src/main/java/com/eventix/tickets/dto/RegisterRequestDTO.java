package com.eventix.tickets.dto;

import com.eventix.tickets.domain.enums.UserRoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequestDTO {
    private String username;
    private String email;
    private String password;
    private UserRoleEnum role;
}
