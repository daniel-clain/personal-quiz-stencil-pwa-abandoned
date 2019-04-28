import { Component, State } from '@stencil/core';
import ITag from '../../interfaces/tag.interface';
import { TagService } from '../../classes/tag-service/tag.service';

@Component({ tag: 'tags-component' })
export class TagsComponent {
  @State() tags: ITag[] = []
  @State() selectedTag: ITag
  @State() newTag: ITag = {
    id: null,
    name: null
  }
  tagService: TagService

  componentWillLoad(){
    this.tagService = TagService.getSingletonInstance()
    this.tagService.tags$.subscribe((tags: ITag[]) => this.tags = tags)
  }


  submitNewTag(){
    if(!this.newTag.name){
      return
    }
    this.tagService.add(this.newTag)
    this.newTag = {
      id: null,
      name: null
    }
    
  }
  submitUpdatedTag(){
    this.tagService.update(this.selectedTag)
  }

  selectTag(tag){
    this.selectedTag = Object.assign({}, tag);
  }

  deleteTag(){
    const deleteConfirmed: boolean = window.confirm(`Are you sure you want to delete tag: \n\n ${this.selectedTag.name}`)

    if(deleteConfirmed){
      this.tagService.delete(this.selectedTag)
    }
  }


  updateTagName(event){
    this.newTag.name = event.path[0].value
  }

  render() {
    return (
      <div class='tag-management'>
        <h3>Add Tag</h3>

          <span class="field__name">Tag Name: </span>
          <input class="field__input" value={this.newTag.name} onInput={event => this.updateTagName(event)}/>
          <button onClick={() => this.submitNewTag()}>Submit</button>

        <hr/>

        <h2>Tags List</h2>
        {this.tags.map((tag: ITag) => {
            return this.selectedTag && this.selectedTag.id == tag.id ?
              <div class="list__item--expanded">
                <hr/>
                <h3>Edit Tag: { tag.name }</h3>
                <div class="field">
                  <span class="field__name">Tag: </span>
                  <input class="field__input" value={this.selectedTag.name}/>
                </div>

                <button onClick={() => this.submitUpdatedTag()}>Update</button>
                <button type="button" onClick={() => this.selectTag(null)}>Close</button>
                <button onClick={() => this.deleteTag()}> Delete</button >
                <hr/>
              </div>
              :
              <div class="list__item" onClick={() => this.selectTag(tag)}>
                { tag.name }
              </div>
        })}
      </div>
    )
  }
}
