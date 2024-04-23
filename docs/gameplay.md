# What to model in the game

There are several aspects of an enterprise that can be modeled in a gameplay.

- Project Management: a flow of tasks to be done that takes time.
  - Here goes also decisions to be made. Because most of them need some information
    to be obtained through tasks execution.
  - Most of the tasks and decisions can be organized in a graph from the beginning. However, some
    arise as consequences of some events int the game. These also can be pretty urgent.
- Budget
- ERP/MES
  - Supplies (tanks for raw material and amount available)
  - Warehouse (for produced material (tank for ionic liquid))
  - Shipments (for both supplies & warehouse)
    - Scheduling
  - Maintenance + downtime
    - Factory plan
    - Equipment under-performance
  - ⏳ R&D
  - ⏳ Upgrades
  - Buildings
  - ⏳ Accidents?
  - Quality Control
- HR
  - Tasks assignability
  - Contractors
    - Usually companies/shops, can be assigned to some tasks, paid per task
  - Staff
    - Office workers (can auto-assign tasks)
    - Technicians
      - can cause downtime (due to leaves)
      - can rise alarms (needed maintenance, poor quality)
  - Vacations/leaves/sick lives etc.
  - Wages
- CRM/SRM
  - Prospective customers
    - Can have several statuses, ie. investigation, negotiation etc.
    - Investigation and negotiation can lead to dead end. However, can be re-done, depends on company reputation
  - Prospective suppliers
  - Contracts
  - Deadlines
  - Complains
    - Reputation score
      - Reputation for suppliers?
    - Fines
    - Lawsuits

## Ideas for game dynamic

- Scheduled shipments can be delayed, which cause downtime
- Industry-wide supply chain troubles
- The reactor has a catalyst of a wrong shape, so we need to modify the reactor
- Maintenance is just happens, causes downtime
- Vacations/leaves just happen, cause downtime
- New cheaper supplier -> turned out, quality not reliable, at some point this will cause bad product & angry customer
  - This mean, that suppliers have quality & reliability parameters
- Customer can leave, but you can hold them, offering discount
- Supplier also can leave/increase price, this can cause downtime
- AI Mode: negotiations with customers & suppliers
