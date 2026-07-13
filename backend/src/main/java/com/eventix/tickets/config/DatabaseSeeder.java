package com.eventix.tickets.config;

import com.eventix.tickets.domain.entity.User;
import com.eventix.tickets.domain.enums.UserRoleEnum;
import com.eventix.tickets.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed Attendee
            userRepository.save(User.builder()
                    .username("attendee")
                    .email("attendee@example.com")
                    .password(passwordEncoder.encode("password"))
                    .role(UserRoleEnum.ATTENDEE)
                    .build());

            // Seed Organizer
            userRepository.save(User.builder()
                    .username("organizer")
                    .email("organizer@example.com")
                    .password(passwordEncoder.encode("password"))
                    .role(UserRoleEnum.ORGANIZER)
                    .build());

            // Seed Staff
            userRepository.save(User.builder()
                    .username("staff")
                    .email("staff@example.com")
                    .password(passwordEncoder.encode("password"))
                    .role(UserRoleEnum.STAFF)
                    .build());
            
            System.out.println("Database seeded successfully with default users: 'attendee', 'organizer', 'staff' (password is 'password').");
        }
    }
}
