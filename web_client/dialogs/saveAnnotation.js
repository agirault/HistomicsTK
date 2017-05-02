import _ from 'underscore';

import View from 'girder/views/View';
import { restRequest } from 'girder/rest';

import saveAnnotation from '../templates/dialogs/saveAnnotation.pug';

/**
 * Create a modal dialog with fields to edit the properties of
 * an annotation before POSTing it to the server.
 */
var SaveAnnotation = View.extend({
    events: {
        'click .h-submit': 'save',
        'submit form': 'save'
    },

    render() {
        this.$el.html(
            saveAnnotation({
                annotation: this.annotation.toJSON().annotation || {},
                titleText: this.titleText
            })
        ).girderModal(this);
    },

    /**
     * Respond to form submission.  Triggers a `g:save` event on the
     * AnnotationModel.
     */
    save(evt) {
        evt.preventDefault();
        if (!this.$('#h-annotation-name').val()) {
            this.$('#h-annotation-name').parent()
                .addClass('has-error');
            this.$('.g-validation-failed-message')
                .text('Please enter a name.')
                .removeClass('hidden');
            return;
        }

        this.annotation.set({
            name: this.$('#h-annotation-name').val(),
            description: this.$('#h-annotation-description').val()
        });
        this.$el.modal('hide');

        var path = `annotation/${this.annotation.id}`;
        var data = this.annotation.toJSON();
        var method = 'PUT';
        if (this.annotation.isNew()) {
            method = 'POST';
            path = `annotation?itemId=${this.image.id}`;

            data.elements = data.annotation.elements;
        }
        data = _.pick(data, ['name', 'description', 'attributes', 'elements']);
        return restRequest({
            path: path,
            contentType: 'application/json',
            processData: false,
            data: JSON.stringify(data),
            type: method
        }).then((data) => {
            this.annotation.set(data);
            this.annotation.trigger('g:save', data);
            return data;
        });
    }
});

/**
 * Create a singleton instance of this widget that will be rendered
 * when `show` is called.
 */
var dialog = new SaveAnnotation({
    parentView: null
});

/**
 * Show the save dialog box.  Watch for the `g:save` event on the
 * `AnnotationModel` to respond to user submission of the form.
 *
 * @param {AnnotationModel} annotationElement The element to edit
 * @param {ItemModel} [image] The image containing the annotation
 * @param {string} [titleText='Save annotation'] Override the default modal title
 * @returns {SaveAnnotation} The dialog's view
 */
function show(annotation, image, titleText) {
    dialog.image = image;
    dialog.annotation = annotation;
    dialog.titleText = titleText || 'Save annotation';
    dialog.setElement('#g-dialog-container').render();
    return dialog;
}

export default show;
