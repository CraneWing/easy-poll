// small jQuery script to add extra text fields
// to a form. here used if user wants to add
// more choices to a poll.
$(document).ready(function() {
	var n = 0;
	$('.add-field').on('click', function() {
		n++;
		$('.new-fields').append(
			'<div class="form-group">' + 
			'<input type="text" class="form-control new" name="new-' + n + '"></div>'
		);

		$('#new-fields').val(n);
	});
});