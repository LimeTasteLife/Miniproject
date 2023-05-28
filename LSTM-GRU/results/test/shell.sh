#!/bin/zsh

# Loop through all the GRU_*_*_*_test.png files
for file in GRU_*_*_*_test.png
do
  # Define the new file name by replacing GRU_ with GRU_A1_
  new_file="${file/GRU_/GRU_A1_}"

  # Rename the file
  mv "$file" "$new_file"
done

# Loop through all the LSTM_*_*_*_test.png files
for file in LSTM_*_*_*_test.png
do
  # Define the new file name by replacing LSTM_ with LSTM_A1_
  new_file="${file/LSTM_/LSTM_A1_}"

  # Rename the file
  mv "$file" "$new_file"
done
