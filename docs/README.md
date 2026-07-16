# HotelHubManagement - Architecture Documentation

DDD / modular-architecture documentation aligned with `srae.sql` and the
TypeORM entities in `backend/src/modules/**/entities/`.

## Layout

```
docs/
├── README.md
├── schema.sql                  ← deployed PostgreSQL schema (single source of truth)
├── domain/
│   ├── er-diagram.mmd          ← 16 tables, 9 bounded contexts
│   ├── domain-model.mmd        ← aggregates, entities, enums, events
│   └── context-map.mmd         ← inter-context relationships
├── architecture/
│   ├── system-context.mmd
│   └── container.mmd
├── modules/
│   ├── accounts/class.mmd
│   ├── auth/class.mmd
│   ├── customers/class.mmd
│   ├── rooms/class.mmd
│   ├── bookings/class.mmd
│   ├── payments/class.mmd
│   ├── services/class.mmd
│   ├── staff/class.mmd
│   ├── housekeeping/class.mmd
│   └── maintenance/class.mmd
├── usecases/usecase.puml
├── packages/package.puml
└── rules/dependency-rules.mmd
```

## Bounded contexts (9)

| Context | Aggregate root | Module |
|---|---|---|
| Identity | `Account` | `accounts/` |
| Customer Management | `Customer` | `customers/` |
| Staff | `StaffInfo` | `staff/` |
| Room Catalogue | `RoomType` (+ `Room`) | `rooms/` |
| Booking Lifecycle | `Booking` (+ versions, details) | `bookings/` |
| Payment Settlement | `Payment` | `payments/` |
| Ancillary Services | `Service` | `services/` |
| Housekeeping | `ChecklistTemplate` | `housekeeping/` |
| Maintenance | `IssueReport` | `maintenance/` |

## Source-of-truth order

1. **`schema.sql`** is what runs against PostgreSQL today.
2. The **TypeORM entities** in `backend/src/modules/**/entities/` mirror `schema.sql` 1:1.
3. The **ER diagram** mirrors `schema.sql`.
4. The **domain model** is the DDD view.
5. The **context map** describes inter-context relationships.

## Naming convention

- PascalCase identifiers throughout (`CustomerId`, `RoomID`, `BookingVersion`).
- Plural table names (`Customers`, `Rooms`, `Bookings`).
- FK columns named after the referenced PK (`CustomerId`, `TypeID`, `VersionId`).
- `Accounts` is the shared identity root — both `Customers` and `StaffInfo`
  reference it 1:1 via `AccountId`.
- `Bookings` evolves through `BookingVersions` (every change = new version).
- `Payments` attach to a `VersionId`, not a `BookingId` directly.

## How to add a new bounded context

1. Create `backend/src/modules/<name>/` (controller, service, entities, dto/).
2. Wire the new module into `backend/src/app.module.ts`.
3. Mirror the new tables in `docs/schema.sql` and add an ER block to
   `docs/domain/er-diagram.mmd`.
4. Add aggregates to `docs/domain/domain-model.mmd` and a node to
   `docs/domain/context-map.mmd`.
5. Update `docs/packages/package.puml` with the new dependency edges.
6. Author `docs/modules/<name>/class.mmd` following the stereotype conventions.

## Rendering

- `.mmd` — Mermaid CLI: `npx @mermaid-js/mermaid-cli -i file.mmd`
- `.puml` — PlantUML CLI: `npx -p @plantuml/cli plantuml file.puml`