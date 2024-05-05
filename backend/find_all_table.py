from sqlalchemy import create_engine, MetaData


def list_tables_and_columns():
    engine = create_engine("sqlite:///backend/quez.sqlite")
    metadata = MetaData()
    metadata.reflect(bind=engine)

    for table_name in metadata.tables:
        print("Table Name:", table_name)
        table = metadata.tables[table_name]
        for column in table.columns:
            print("   Column Name:", column.name)


if __name__ == "__main__":
    list_tables_and_columns()
