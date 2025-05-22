<script lang="ts">
	let inputValue = $state('');
</script>

<div class="card">
	<h2>Primary Button</h2>
	<button class="btn primary">Click Me</button>
</div>

<div class="card">
	<h2>Secondary Button</h2>
	<button class="btn secondary">Click Me</button>
</div>

<div class="card">
	<h2>Input Box</h2>
	<input bind:value={inputValue} placeholder="Enter text…" />
	<p class="text-secondary">You typed: {inputValue}</p>
</div>

<div class="card">
	<h2>Hover Effect</h2>
	<div class="hover-box">Hover over me</div>
</div>

<div class="card badges">
	<h2>Badges</h2>
	<span class="badge primary">New</span>
	<span class="badge secondary">Sale</span>
</div>

<style>
	p {
		margin: 0;
		color: var(--text-secondary-color);
	}

	.card {
		background-color: var(--alt-surface-color);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: 15px;
		margin-top: 16px;
	}

	.btn {
		padding: 10px 15px;
		border: none;
		border-radius: 4px;
		color: var(--text-primary-color);
		cursor: pointer;
		margin-top: 10px;
	}

	.btn.primary {
		background-color: var(--primary-color);
	}

	.btn.primary:hover {
		background-color: var(--surface-hover-color);
	}

	.btn.secondary {
		background-color: var(--secondary-color);
	}

	.btn.secondary:hover {
		background-color: var(--alt-surface-hover-color);
	}

	input {
		width: 100%;
		padding: 8px;
		margin-top: 10px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background-color: var(--surface-color);
		color: var(--text-primary-color);
	}

	input::placeholder {
		color: var(--text-secondary-color);
	}

	.hover-box {
		padding: 20px;
		background-color: var(--alt-surface-color);
		text-align: center;
		border-radius: 4px;
		border: 1px solid var(--border-color);
		transition: background-color 0.2s;
		cursor: pointer;
	}

	.hover-box:hover {
		background-color: var(--surface-hover-color);
	}

	.badge {
		display: inline-block;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 0.8rem;
		color: var(--text-primary-color);
		margin-right: 8px;
	}

	.badge.primary {
		background-color: var(--primary-color);
	}

	.badge.secondary {
		background-color: var(--secondary-color);
	}
	.badges {
		margin-bottom: 16px;
	}
</style>
