import React, { useState } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton,
  Box,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Ara...',
  fullWidth = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        width: fullWidth ? '100%' : 'auto',
        maxWidth: '600px',
        '& .MuiOutlinedInput-root': {
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 245, 255, 0.1)',
          },
          '&.Mui-focused': {
            boxShadow: '0px 4px 12px rgba(0, 245, 255, 0.2)',
          }
        }
      }}
    >
      <TextField
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(0, 245, 255, 0.7)' }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
                sx={{
                  color: 'rgba(0, 245, 255, 0.7)',
                  '&:hover': {
                    color: '#00F5FF',
                    backgroundColor: 'rgba(0, 245, 255, 0.1)',
                  }
                }}
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            backgroundColor: 'rgba(45, 27, 105, 0.3)',
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 245, 255, 0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 245, 255, 0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00F5FF',
            },
            '& .MuiInputBase-input': {
              color: '#FFFFFF',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
            },
          }
        }}
      />
    </Box>
  );
};

export default SearchBar; 