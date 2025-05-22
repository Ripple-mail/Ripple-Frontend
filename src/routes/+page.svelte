<script lang="ts">
	let count = $state(0);

	function handleClick(isLMB: boolean) {
		if (isLMB) {
			count += 1;
		} else {
			count -= 1;
		}
	}
</script>

<svelte:head>
	<title>Button :skull:</title>
</svelte:head>

<div class="main">
	<button
		onclick={() => handleClick(true)}
		oncontextmenu={(event) => {
			event.preventDefault();
			handleClick(false);
		}}
	>
		Press this!
	</button>

	<div class="counter">
		<p>Count: {count}</p>
		<p class="tip">Tip: Try left clicking on the button</p>
	</div>
</div>

<style>
	.main {
		background-color: var(--alt-surface-color);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: 15px;
		margin-top: 16px;
	}
	.counter {
		margin-top: 20px;
	}

	.tip {
		color: var(--text-secondary-color);
	}
	button {
		padding: 10px 15px;
		border: none;
		border-radius: 4px;
		color: var(--text-primary-color);
		cursor: pointer;
		margin-top: 10px;
		background-color: var(--primary-color);
	}
</style>
