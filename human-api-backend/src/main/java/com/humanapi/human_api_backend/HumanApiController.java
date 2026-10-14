
package com.humanapi.human_api_backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HumanApiController {

    private final PersonRepository personRepository;
    private final ConnectionRequestRepository connectionRepository;

    public HumanApiController(
            PersonRepository personRepository,
            ConnectionRequestRepository connectionRepository) {
        this.personRepository = personRepository;
        this.connectionRepository = connectionRepository;
    }

    // Insert demo profiles only when the database is empty
   
@Bean
CommandLineRunner seedPeople(PersonRepository repository) {
    return args -> {
        if (repository.count() == 0) {
            repository.saveAll(List.of(
                new Person(
                    1L, "Aryan Mehta", "AM",
                    "Creative & Developer",
                    "I turn ideas into things people can use.",
                    "violet",
                    List.of("Video Editing", "Java", "Photography"),
                    List.of("Photoshop", "Guitar")
                ),
                new Person(
                    2L, "Kavya Shah", "KS",
                    "Designer & Artist",
                    "Designing things that make people stop scrolling.",
                    "orange",
                    List.of("Photoshop", "UI Design", "Illustration"),
                    List.of("Java", "Video Editing")
                ),
                new Person(
                    3L, "Omkar Patil", "OP",
                    "Tech Enthusiast",
                    "Learning something new every single day.",
                    "blue",
                    List.of("Python", "DSA", "Java"),
                    List.of("Video Editing", "UI Design")
                ),
                new Person(
                    4L, "Priya Nair", "PN",
                    "Music & Media",
                    "Music, storytelling, and creative experiments.",
                    "pink",
                    List.of("Guitar", "Video Editing", "Content Writing"),
                    List.of("Python", "Photography")
                )
            ));
        }

        if (!repository.existsById(99L)) {
            repository.save(new Person(
                99L,
                "Sai",
                "SA",
                "Builder in progress",
                "Here to learn, share, and build cool things.",
                "green",
                List.of("Java", "Python"),
                List.of("UI Design")
            ));
        }
    };
}


    // Health-check endpoint
    @GetMapping("/api/hello")
    public Map<String, Object> hello() {
        return Map.of(
            "message", "Human API backend is running!",
            "project", "Human API",
            "status", "success"
        );
    }

    // List available skills
    @GetMapping("/api/skills")
    public List<String> getSkills() {
        return List.of(
            "Java",
            "Python",
            "Web Development",
            "UI Design",
            "Video Editing",
            "Photography",
            "DSA",
            "Content Writing"
        );
    }

    // Get all profiles from the database
    @GetMapping("/api/people")
    public List<Person> getPeople() {
        return personRepository.findAll();
    }

    // Create and save a new profile
    @PostMapping("/api/people")
    @ResponseStatus(HttpStatus.CREATED)
    public Person createPerson(@RequestBody Person person) {
        person.setId(null);
        return personRepository.save(person);
    }
    @PutMapping("/api/people/{id}")
public Person updatePerson(
        @PathVariable Long id,
        @RequestBody Person updatedPerson) {

    Person person = personRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Person not found"));

    person.setName(updatedPerson.getName());
    person.setInitials(updatedPerson.getInitials());
    person.setRole(updatedPerson.getRole());
    person.setBio(updatedPerson.getBio());
    person.setColor(updatedPerson.getColor());
    person.setOffers(updatedPerson.getOffers());
    person.setNeeds(updatedPerson.getNeeds());

    return personRepository.save(person);
}

    // Get all saved connection requests
    @GetMapping("/api/connections")
    public List<ConnectionRequest> getConnections() {
        return connectionRepository.findAll();
    }

    // Create and save a connection request
    @PostMapping("/api/connections")
    @ResponseStatus(HttpStatus.CREATED)
    public ConnectionRequest createConnection(
            @RequestBody ConnectionRequest request) {

        if (request.getSenderId() == null
                || request.getReceiverId() == null) {
            throw new IllegalArgumentException(
                "Sender ID and receiver ID are required."
            );
        }

        if (request.getSenderId().equals(request.getReceiverId())) {
            throw new IllegalArgumentException(
                "You cannot connect with yourself."
            );
        }

        if (!personRepository.existsById(request.getSenderId())
                || !personRepository.existsById(request.getReceiverId())) {
            throw new IllegalArgumentException(
                "Both people must exist."
            );
        }

        request.setId(null);
        request.setStatus("PENDING");

        return connectionRepository.save(request);
    }
    
@PatchMapping("/api/connections/{id}/status")
public ConnectionRequest updateConnectionStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {

    ConnectionRequest request = connectionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Connection request not found"));

    String status = body.get("status");

    if (!"ACCEPTED".equals(status) && !"REJECTED".equals(status)) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Status must be ACCEPTED or REJECTED");
    }

    request.setStatus(status);
    return connectionRepository.save(request);
}

}
