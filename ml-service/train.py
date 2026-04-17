import argparse
from pathlib import Path

import pandas as pd

from app.trainer import train_from_dataframe


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train LSTM model using historical workload CSV data.")
    parser.add_argument("--data", required=True, help="Path to input CSV file.")
    parser.add_argument("--target-column", default="workload", help="Name of the target column.")
    parser.add_argument("--sequence-length", type=int, default=24, help="Sequence length for LSTM windows.")
    parser.add_argument("--epochs", type=int, default=20, help="Training epochs.")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_path = Path(args.data)
    if not data_path.exists():
        raise FileNotFoundError(f"Input CSV not found: {data_path}")

    dataframe = pd.read_csv(data_path)
    train_samples, validation_loss, model_path, scaler_path = train_from_dataframe(
        dataframe=dataframe,
        target_column=args.target_column,
        sequence_length=args.sequence_length,
        epochs=args.epochs,
        batch_size=args.batch_size,
    )

    print("Training complete")
    print(f"Train samples: {train_samples}")
    print(f"Validation loss: {validation_loss:.6f}")
    print(f"Saved model: {model_path}")
    print(f"Saved scaler: {scaler_path}")


if __name__ == "__main__":
    main()
