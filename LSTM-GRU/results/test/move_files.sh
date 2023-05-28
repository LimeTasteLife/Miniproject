#!/bin/zsh

# Loop through all the GRU_*_*_*_test.png files
for file in LSTM_*_*_*_*_test.png
do
  # Define the new file name by replacing GRU_ with GRU_A1_
  new_file="${file/LSTM_A)_/LSTM_A0_}"

  # Rename the file
  mv "$file" "$new_file"
done