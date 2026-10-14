
package com.humanapi.human_api_backend;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "people")
public class Person {

    @Id
    private Long id;

    private String name;
    private String initials;
    private String role;
    private String bio;
    private String color;

    @ElementCollection
    private List<String> offers = new ArrayList<>();

    @ElementCollection
    private List<String> needs = new ArrayList<>();

    public Person() {}

    public Person(Long id, String name, String initials, String role,
                  String bio, String color, List<String> offers,
                  List<String> needs) {
        this.id = id;
        this.name = name;
        this.initials = initials;
        this.role = role;
        this.bio = bio;
        this.color = color;
        this.offers = new ArrayList<>(offers);
        this.needs = new ArrayList<>(needs);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getInitials() { return initials; }
    public String getRole() { return role; }
    public String getBio() { return bio; }
    public String getColor() { return color; }
    public List<String> getOffers() { return offers; }
    public List<String> getNeeds() { return needs; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setInitials(String initials) { this.initials = initials; }
    public void setRole(String role) { this.role = role; }
    public void setBio(String bio) { this.bio = bio; }
    public void setColor(String color) { this.color = color; }
    public void setOffers(List<String> offers) { this.offers = offers; }
    public void setNeeds(List<String> needs) { this.needs = needs; }
}
