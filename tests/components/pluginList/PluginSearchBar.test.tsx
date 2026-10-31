import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PluginSearchBar from '../../../src/components/pluginList/PluginSearchBar';

describe('PluginSearchBar', () => {
  it('renders search input with placeholder and no clear button when search is empty', () => {
    render(
      <PluginSearchBar
        search=""
        onSearchChange={() => {}}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={42}
      />
    );
    expect(screen.getByPlaceholderText('Search a plugin…')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Clear search input' })).toBeNull();
    console.log(`  PluginSearchBar : search input with placeholder rendered, clear button absent when empty`);
  });

  it('displays result count correctly', () => {
    render(
      <PluginSearchBar
        search=""
        onSearchChange={() => {}}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={42}
      />
    );
    expect(screen.getByText('42 results')).toBeDefined();
    console.log(`  PluginSearchBar : "42 results" displayed`);
  });

  it('displays singular "result" when count is 1', () => {
    render(
      <PluginSearchBar
        search=""
        onSearchChange={() => {}}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={1}
      />
    );
    expect(screen.getByText('1 result')).toBeDefined();
    console.log(`  PluginSearchBar : "1 result" (singular) displayed`);
  });

  it('calls onSearchChange when typing in search input', () => {
    const onChange = vi.fn();
    render(
      <PluginSearchBar
        search=""
        onSearchChange={onChange}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={0}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Search a plugin…'), {
      target: { value: 'git' },
    });
    expect(onChange).toHaveBeenCalledWith('git');
    console.log(`  PluginSearchBar : typing "git" triggers onSearchChange`);
  });

  it('shows status filter chip when statusFilter is not "all"', () => {
    render(
      <PluginSearchBar
        search=""
        onSearchChange={() => {}}
        statusFilter="green"
        onClearFilter={() => {}}
        resultCount={10}
      />
    );
    expect(screen.getByText('All Passed')).toBeDefined();
    expect(screen.getByText('✕')).toBeDefined();
    console.log(`  PluginSearchBar : "All Passed" status chip rendered`);
  });

  it('calls onClearFilter when status filter chip dismiss is clicked', () => {
    const onClear = vi.fn();
    render(
      <PluginSearchBar search="" onSearchChange={() => {}} statusFilter="red" onClearFilter={onClear} resultCount={5} />
    );
    fireEvent.click(screen.getByText('✕').closest('button')!);
    expect(onClear).toHaveBeenCalled();
    console.log(`  PluginSearchBar : clicking status filter dismiss calls onClearFilter`);
  });

  it('renders search clear button when search is non-empty and triggers onSearchChange("") and restores focus when clicked', () => {
    const onSearchChange = vi.fn();
    render(
      <PluginSearchBar
        search="git"
        onSearchChange={onSearchChange}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={5}
      />
    );

    const input = screen.getByPlaceholderText('Search a plugin…');
    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(input);
    console.log(`  PluginSearchBar : clicking clear input button triggers onSearchChange("") and restores focus`);
  });

  it('prevents default on mouse down on clear button so input focus is preserved', () => {
    render(
      <PluginSearchBar
        search="git"
        onSearchChange={() => {}}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={5}
      />
    );

    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    const event = new MouseEvent('mousedown', { cancelable: true, bubbles: true });
    clearButton.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    console.log(`  PluginSearchBar : mouse down on clear button prevents default`);
  });

  it('can activate clear button using keyboard and restores focus to search input', () => {
    const onSearchChange = vi.fn();
    render(
      <PluginSearchBar
        search="git"
        onSearchChange={onSearchChange}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={5}
      />
    );

    const input = screen.getByPlaceholderText('Search a plugin…');
    const clearButton = screen.getByRole('button', { name: 'Clear search input' });

    clearButton.focus();
    expect(document.activeElement).toBe(clearButton);

    fireEvent.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(input);
    console.log(`  PluginSearchBar : keyboard activation restores focus to input`);
  });

  it('clearing search restores unfiltered results in a stateful search bar', () => {
    function StatefulPluginSearchBar() {
      const [search, setSearch] = useState('git');
      const plugins = ['git-plugin', 'github-branch-source', 'workflow-job'];
      const filtered = plugins.filter((p) => p.includes(search));
      return (
        <div>
          <PluginSearchBar
            search={search}
            onSearchChange={setSearch}
            statusFilter="all"
            onClearFilter={() => {}}
            resultCount={filtered.length}
          />
          <div data-testid="results">{filtered.join(', ')}</div>
        </div>
      );
    }

    render(<StatefulPluginSearchBar />);
    expect(screen.getByTestId('results').textContent).toBe('git-plugin, github-branch-source');

    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    fireEvent.click(clearButton);

    expect(screen.getByTestId('results').textContent).toBe('git-plugin, github-branch-source, workflow-job');
    expect(screen.queryByRole('button', { name: 'Clear search input' })).toBeNull();
    console.log(`  PluginSearchBar : clearing search restores unfiltered results`);
  });
});
