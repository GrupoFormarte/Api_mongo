# Domain Layer

This directory contains the core business logic and domain models of the application.

## Structure

- `entities/`: Core business entities
  - QualificationEntity
  - ImageEntity
  - TimeEntity
  - SimulationEntity

- `valueObjects/`: Immutable value objects
  - ImageMetadata
  - QualificationScore
  - TimeZone

- `aggregates/`: Aggregate roots that maintain consistency
  - QualificationAggregate
  - SimulationAggregate

- `events/`: Domain events
  - QualificationCompletedEvent
  - ImageUploadedEvent
  - SimulationStartedEvent

## Domain Services

Domain services will handle complex operations that don't naturally fit within entities:

- QualificationService
- ImageProcessingService
- TimeManagementService
- SimulationService