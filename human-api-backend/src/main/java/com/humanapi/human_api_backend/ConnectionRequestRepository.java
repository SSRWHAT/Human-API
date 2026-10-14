
package com.humanapi.human_api_backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConnectionRequestRepository
        extends JpaRepository<ConnectionRequest, Long> {
}
