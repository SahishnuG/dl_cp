from sqlalchemy import inspect, text
from helper_funcs import engine

inspector = inspect(engine)

tables = inspector.get_table_names()
print("Tables:", tables)

if not tables:
    print("No tables found.")

for table_name in tables:
    print(f"\n=== Table: {table_name} ===")
    columns = inspector.get_columns(table_name)

    if not columns:
        print("No columns found.")
        continue

    print("Fields:")
    for column in columns:
        print(
            f"- {column['name']} | "
            f"type={column['type']} | "
            f"nullable={column['nullable']} | "
            f"primary_key={column.get('primary_key', False)} | "
            f"default={column.get('default')}"
        )

    # Show up to 5 sample rows to verify inserted data.
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT * FROM {table_name} LIMIT 5"))
        rows = result.fetchall()

    print("Sample rows (max 5):")
    if not rows:
        print("- <empty table>")
    else:
        for idx, row in enumerate(rows, start=1):
            print(f"- Row {idx}: {dict(row._mapping)}")