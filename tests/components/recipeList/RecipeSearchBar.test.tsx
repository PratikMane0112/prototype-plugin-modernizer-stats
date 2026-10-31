import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeSearchBar from '../../../src/components/recipeList/RecipeSearchBar';

describe('RecipeSearchBar', () => {
  it('renders search input with placeholder and no clear button when search is empty', () => {
    render(
      <RecipeSearchBar search="" onSearchChange={() => {}} tierFilter="all" onClearFilter={() => {}} resultCount={20} />
    );
    expect(screen.getByPlaceholderText('Search a recipe…')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Clear search input' })).toBeNull();
    console.log(`  RecipeSearchBar : search input with placeholder rendered, clear button absent when empty`);
  });

  it('displays result count', () => {
    render(
      <RecipeSearchBar search="" onSearchChange={() => {}} tierFilter="all" onClearFilter={() => {}} resultCount={15} />
    );
    expect(screen.getByText('15 results')).toBeDefined();
    console.log(`  RecipeSearchBar : "15 results" displayed`);
  });

  it('displays singular "result" when count is 1', () => {
    render(
      <RecipeSearchBar search="" onSearchChange={() => {}} tierFilter="all" onClearFilter={() => {}} resultCount={1} />
    );
    expect(screen.getByText('1 result')).toBeDefined();
    console.log(`  RecipeSearchBar : "1 result" (singular) displayed`);
  });

  it('calls onSearchChange when typing', () => {
    const onChange = vi.fn();
    render(
      <RecipeSearchBar search="" onSearchChange={onChange} tierFilter="all" onClearFilter={() => {}} resultCount={0} />
    );
    fireEvent.change(screen.getByPlaceholderText('Search a recipe…'), {
      target: { value: 'Setup' },
    });
    expect(onChange).toHaveBeenCalledWith('Setup');
    console.log(`  RecipeSearchBar : typing "Setup" triggers onSearchChange`);
  });

  it('shows tier filter chip when tierFilter is not "all"', () => {
    render(
      <RecipeSearchBar
        search=""
        onSearchChange={() => {}}
        tierFilter="high"
        onClearFilter={() => {}}
        resultCount={10}
      />
    );
    expect(screen.getByText('High Rate')).toBeDefined();
    expect(screen.getByText('✕')).toBeDefined();
    console.log(`  RecipeSearchBar : "High Rate" chip with dismiss rendered`);
  });

  it('hides tier filter chip when tierFilter is "all"', () => {
    render(
      <RecipeSearchBar search="" onSearchChange={() => {}} tierFilter="all" onClearFilter={() => {}} resultCount={10} />
    );
    expect(screen.queryByText('High Rate')).toBeNull();
    console.log(`  RecipeSearchBar : no filter chip when tierFilter="all"`);
  });

  it('calls onClearFilter when chip dismiss is clicked', () => {
    const onClear = vi.fn();
    render(
      <RecipeSearchBar
        search=""
        onSearchChange={() => {}}
        tierFilter="medium"
        onClearFilter={onClear}
        resultCount={5}
      />
    );
    fireEvent.click(screen.getByText('✕').closest('button')!);
    expect(onClear).toHaveBeenCalled();
    console.log(`  RecipeSearchBar : clicking dismiss calls onClearFilter`);
  });

  it('renders search clear button when search is non-empty and triggers onSearchChange("") and restores focus when clicked', () => {
    const onSearchChange = vi.fn();
    render(
      <RecipeSearchBar
        search="Setup"
        onSearchChange={onSearchChange}
        tierFilter="all"
        onClearFilter={() => {}}
        resultCount={5}
      />
    );

    const input = screen.getByPlaceholderText('Search a recipe…');
    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(input);
    console.log(`  RecipeSearchBar : clicking clear input button triggers onSearchChange("") and restores focus`);
  });

  it('prevents default on mouse down on clear button so input focus is preserved', () => {
    render(
      <RecipeSearchBar
        search="Setup"
        onSearchChange={() => {}}
        tierFilter="all"
        onClearFilter={() => {}}
        resultCount={5}
      />
    );

    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    const event = new MouseEvent('mousedown', { cancelable: true, bubbles: true });
    clearButton.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    console.log(`  RecipeSearchBar : mouse down on clear button prevents default`);
  });

  it('can activate clear button using keyboard and restores focus to search input', () => {
    const onSearchChange = vi.fn();
    render(
      <RecipeSearchBar
        search="Setup"
        onSearchChange={onSearchChange}
        tierFilter="all"
        onClearFilter={() => {}}
        resultCount={5}
      />
    );

    const input = screen.getByPlaceholderText('Search a recipe…');
    const clearButton = screen.getByRole('button', { name: 'Clear search input' });

    clearButton.focus();
    expect(document.activeElement).toBe(clearButton);

    fireEvent.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(input);
    console.log(`  RecipeSearchBar : keyboard activation restores focus to input`);
  });

  it('clearing search restores unfiltered results in a stateful search bar', () => {
    function StatefulRecipeSearchBar() {
      const [search, setSearch] = useState('Setup');
      const recipes = ['SetupDependabot', 'SetupJenkinsfile', 'MigrateToJUnit5'];
      const filtered = recipes.filter((r) => r.includes(search));
      return (
        <div>
          <RecipeSearchBar
            search={search}
            onSearchChange={setSearch}
            tierFilter="all"
            onClearFilter={() => {}}
            resultCount={filtered.length}
          />
          <div data-testid="results">{filtered.join(', ')}</div>
        </div>
      );
    }

    render(<StatefulRecipeSearchBar />);
    expect(screen.getByTestId('results').textContent).toBe('SetupDependabot, SetupJenkinsfile');

    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    fireEvent.click(clearButton);

    expect(screen.getByTestId('results').textContent).toBe('SetupDependabot, SetupJenkinsfile, MigrateToJUnit5');
    expect(screen.queryByRole('button', { name: 'Clear search input' })).toBeNull();
    console.log(`  RecipeSearchBar : clearing search restores unfiltered results`);
  });
});
